var Manipulator = require('./../../app/Grid/Manipulator.js');
var _ = require('lodash');

var customMatchers = {
    toEqualXML: function(util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                if (!_.isString(actual)) {
                    actual = Manipulator.XMLGridToXMLString(actual);
                }
                if (!_.isString(expected)) {
                    expected = Manipulator.XMLGridToXMLString(expected);
                }
                var result = {};
                result.pass = util.equals(actual, expected);
                if (result.pass) {
                    result.message = "XML is the one wanted";
                } else {
                    result.message = "XML is not the one wanted. Actual VS expected:\n" + actual + "\n" + expected;
                }
                return result;
            }
        };
    }
};

describe("Manipulator", function() {

  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  });

  it("should convert Json to Xml and vice-versa", function() {
    var j = {
        _param1: 1,
        _param2: 2,
        child: {
            _childParam: 3,
            subChild: {
                _subChildParam: 4
            }
        },
        childs: [
            {
                _childs1Param: 5
            },
            {
                _childs2Param: 6
            },
            {
                _childs3Param: 7,
                subChild: {
                    _subChildParam: 8
                }
            }
        ]
    };

    var s = Manipulator.JSONGridToXMLString(j);
    expect(s).toEqual(
        '<grid param1="1" param2="2">' +
            '<child childParam="3">' +
                '<subChild subChildParam="4"/>' +
            '</child>' +
            '<childs childs1Param="5"/>' +
            '<childs childs2Param="6"/>' +
            '<childs childs3Param="7">' +
                '<subChild subChildParam="8"/>' +
            '</childs>' +
        '</grid>'
    );

    var x = Manipulator.JSONGridToXML(j);
    expect(x.childNodes.length).toEqual(1);

    var root = x.documentElement;

    expect(root.attributes.length).toEqual(2);
    expect(root.attributes[0].name).toEqual('param1');
    expect(root.attributes[0].value).toEqual('1');
    expect(root.attributes[1].name).toEqual('param2');
    expect(root.attributes[1].value).toEqual('2');

    expect(root.childNodes.length).toEqual(4);

    var child = root.childNodes[0];
    expect(child.tagName).toEqual('child');
    expect(child.attributes.length).toEqual(1);
    expect(child.attributes[0].name).toEqual('childParam');
    expect(child.attributes[0].value).toEqual('3');
    expect(child.childNodes.length).toEqual(1);

    var subChild = child.childNodes[0];
    expect(subChild.tagName).toEqual('subChild');
    expect(subChild.attributes.length).toEqual(1);
    expect(subChild.attributes[0].name).toEqual('subChildParam');
    expect(subChild.attributes[0].value).toEqual('4');
    expect(subChild.childNodes.length).toEqual(0);

    child = root.childNodes[1];
    expect(child.tagName).toEqual('childs');
    expect(child.attributes.length).toEqual(1);
    expect(child.attributes[0].name).toEqual('childs1Param');
    expect(child.attributes[0].value).toEqual('5');
    expect(child.childNodes.length).toEqual(0);

    child = root.childNodes[2];
    expect(child.tagName).toEqual('childs');
    expect(child.attributes.length).toEqual(1);
    expect(child.attributes[0].name).toEqual('childs2Param');
    expect(child.attributes[0].value).toEqual('6');
    expect(child.childNodes.length).toEqual(0);

    child = root.childNodes[3];
    expect(child.tagName).toEqual('childs');
    expect(child.attributes.length).toEqual(1);
    expect(child.attributes[0].name).toEqual('childs3Param');
    expect(child.attributes[0].value).toEqual('7');
    expect(child.childNodes.length).toEqual(1);

    subChild = child.childNodes[0];
    expect(subChild.tagName).toEqual('subChild');
    expect(subChild.attributes.length).toEqual(1);
    expect(subChild.attributes[0].name).toEqual('subChildParam');
    expect(subChild.attributes[0].value).toEqual('8');
    expect(subChild.childNodes.length).toEqual(0);

    var j2 = Manipulator.XMLGridToJSON(x);
    expect(j2).toEqual(j);

  });

  it("should create a new grid", function() {
    var grid = Manipulator.createBaseGrid('foo', 5);

    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content/>' +
        '</grid>';
    expect(grid).toEqualXML(expected);
  });

  it("should add a row", function() {
    var grid = Manipulator.createBaseGrid('foo', 5);

    // with an empty rows list
    Manipulator.addRow(grid.firstChild); // the grid is the first child of the "root document"
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows/>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // with a rows list with one row
    var row = Manipulator.addRow(grid.firstChild);
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows/>' +
                '<rows/>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // check that we really have the real row
    row.setAttribute('foo', 'bar');
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows/>' +
                '<rows foo="bar"/>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // transform a non-grid node (we have to create a cell for that)
    grid = Manipulator.createBaseGrid('foo', 5);
    row = Manipulator.addRow(grid.firstChild);
    var cell = Manipulator.addCell(row, 'module');
    cell.setAttribute('foo', 'bar');
    cell.querySelector(':scope > content').setAttribute('bar', 'baz');
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows>' +
                    '<cells type="module" foo="bar">' +
                        '<content bar="baz"/>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    Manipulator.addRow(cell);
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows>' +
                    '<cells type="grid" foo="bar">' +
                        '<content>' +
                            '<rows>' +
                                '<cells type="module">' +
                                    '<content bar="baz"/>' +
                                '</cells>' +
                            '</rows>' +
                            '<rows/>' +
                        '</content>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

  });

  it("should add a row before another one", function() {
    var grid = Manipulator.createBaseGrid('foo', 5);
    var row1 = Manipulator.addRow(grid.firstChild);
    row1.setAttribute('created', 'first');

    // add a row before the first one
    var row2 = Manipulator.addRow(grid.firstChild, row1);
    row2.setAttribute('inserted', 'before');

    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows inserted="before"/>' +
                '<rows created="first"/>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // add a module cell and add a row asking to set it before another
    var cell = Manipulator.addCell(row1, 'module');

    // this should fail
    expect(function() {
        Manipulator.addRow(cell, row1)
    }).toThrowError(Manipulator.Exceptions.Inconsistency, "Cannot insert before a row if there is no row");

    // transform this cell to have rows and try to use one from the first level for the beforeRow argument
    var subRow1 = Manipulator.addRow(cell);
    subRow1.setAttribute('created', 'first (sub-row)');

    // this should fail
    expect(function() {
        Manipulator.addRow(cell, row1)
    }).toThrowError(Manipulator.Exceptions.Inconsistency, "The 'beforeRow' must be a child of the content of the 'node'");

    // now a working test but at a sublevel, to be sure
    var subRow2 = Manipulator.addRow(cell, subRow1);
    subRow2.setAttribute('inserted', 'before (sub-row)');

    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows inserted="before"/>' +
                '<rows created="first">' +
                    '<cells type="grid">' +
                        '<content>' +
                            '<rows><cells type="module"><content/></cells></rows>' +
                            '<rows inserted="before (sub-row)"/>' +
                            '<rows created="first (sub-row)"/>' +
                        '</content>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

  });

  it("should add a cell", function() {
    var grid = Manipulator.createBaseGrid('foo', 5);
    var row = Manipulator.addRow(grid.firstChild);

    // with an empty cells list
    Manipulator.addCell(row, 'grid');
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows>' +
                    '<cells type="grid">' +
                        '<content/>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // with a cells list with one cell
    var cell = Manipulator.addCell(row, 'grid');
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows>' +
                    '<cells type="grid">' +
                        '<content/>' +
                    '</cells>' +
                    '<cells type="grid">' +
                        '<content/>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // check that we really have the real cell
    cell.setAttribute('foo', 'bar');
    var expected =
        '<grid name="foo" space="5px" type="mainGrid">' +
            '<content>' +
                '<rows>' +
                    '<cells type="grid">' +
                        '<content/>' +
                    '</cells>' +
                    '<cells type="grid" foo="bar">' +
                        '<content/>' +
                    '</cells>' +
                '</rows>' +
            '</content>' +
        '</grid>';
    expect(grid).toEqualXML(expected);

    // shouldn't be able to add cell with an invalid type
    expect(function() {
        Manipulator.addCell(row, 'foo')
    }).toThrowError(Manipulator.Exceptions.InvalidType, "Cannot add cell of type <foo>. Should be <grid> or <module>");

  });

  it("should create a full grid", function() {
    var grid = Manipulator.createBaseGrid('foo', 5);
    var row1 = Manipulator.addRow(grid.firstChild);
        var cell1 = Manipulator.addCell(row1, 'grid');
            var row = Manipulator.addRow(cell1);
                var cell2 = Manipulator.addCell(row, 'module');
                cell2.querySelector(':scope > content').setAttribute('path', 'path.to.module1');
                var cell3 = Manipulator.addCell(row, 'module');
                cell3.querySelector(':scope > content').setAttribute('path', 'path.to.module2');
            var row3 = Manipulator.addRow(cell1);
                var cell4 = Manipulator.addCell(row3, 'module');
                cell4.querySelector(':scope > content').setAttribute('path', 'path.to.module3');
                var cell5 = Manipulator.addCell(row3, 'grid');
                    var row4 = Manipulator.addRow(cell5);
                        var cell6 = Manipulator.addCell(row4, 'module')
                        cell6.querySelector(':scope > content').setAttribute('path', 'path.to.module4');
        var cell7 = Manipulator.addCell(row1, 'grid');

    var expected = {
        _name:"foo",
        _space:"5px",
        _type:"mainGrid",
        content: {
            rows:[
                {
                    cells:[
                        {
                            _type:"grid",
                            content:{
                                rows:[
                                    {
                                        cells: [
                                            {
                                                _type:"module",
                                                content: {_path: "path.to.module1"}
                                            },
                                            {
                                                _type:"module",
                                                content: {_path: "path.to.module2"}
                                            }
                                        ]
                                    },
                                    {
                                        cells:[
                                            {
                                                _type:"module",
                                                content: {_path: "path.to.module3"}
                                            },
                                            {
                                                _type:"grid",
                                                content:{
                                                    rows:[
                                                        {
                                                            cells:[
                                                                {
                                                                    _type:"module",
                                                                    content: {_path: "path.to.module4"}
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            _type:"grid",
                            content:{}
                        }
                    ]
                }
            ]
        }
    };

    expect(Manipulator.XMLGridToJSON(grid)).toEqual(expected);
  });

    it("should clean a node with one row and one cell", function() {
        var grid = Manipulator.createBaseGrid('test');
        var row = Manipulator.addRow(grid.firstChild);
        var cell = Manipulator.addCell(row, 'module');
        var cellContent = cell.querySelector(':scope > content');
        cellContent.setAttribute('foo', 'bar');

        // we cannot update the main grid
        expect(function() {
            Manipulator.cleanNode(grid.firstChild);
        }).toThrowError(Manipulator.Exceptions.InvalidType, "Cannot clean node of type <mainGrid>. Should be <grid>");

        var expected = {
            _name: 'test',
            _space: '5px',
            _type: 'mainGrid',
            content: {
                rows: [
                    {
                        cells: [
                            {
                                _type: 'module',
                                content: { _foo: 'bar' }
                            }
                        ]
                    }
                ]
            }
        };
        expect(Manipulator.XMLGridToJSON(grid)).toEqual(expected);


        // add a row (which will convert the cell to have rows), and delete it
        row = Manipulator.addRow(cell);
        // remove this added row, we want to keep only the one created to hold our content
        row.parentNode.removeChild(row);

        // check we have the correct cell
        var expectedCell = {
            _type: 'grid',
            content: {
                rows: [
                    {
                        cells: [
                            {
                                _type: 'module',
                                content: { _foo: 'bar' }
                            }
                        ]
                    }
                ]
            }
        };
        expect(Manipulator.XMLGridToJSON(cell.parentNode)).toEqual(expectedCell);

        // then clean
        Manipulator.cleanNode(cell);

        // we should be back to the original grid
        expect(Manipulator.XMLGridToJSON(cell.parentNode)).toEqual(expected.content.rows[0].cells[0]);
        expect(Manipulator.XMLGridToJSON(grid)).toEqual(expected);

    });

});