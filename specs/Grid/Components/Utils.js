var React = require('react/addons');  // react + addons
var TestUtils = React.addons.TestUtils;

var Actions = require('../../../app/Grid/Actions.js');
var Manipulator = require('../../../app/Grid/Manipulator.js');

var Row = require('../../../app/Grid/Components/Row.jsx');
var SubGrid = require('../../../app/Grid/Components/SubGrid.jsx');


var componentUtils = {
    _componentsCache: [],

    makeTestGrid: function() {
        var testGrid = Manipulator.XMLStringToXMLGrid(
            '<grid name="Test grid" space="5px" type="mainGrid">' +
                '<content>' +
                    '<rows>' +
                        '<cells type="module"><content component="Module.Test1" text="test 1-1"/></cells>' +
                        '<cells type="grid">' +
                            '<content>' +
                                '<rows>' +
                                    '<cells type="module"><content component="Module.Test2" text="test 2-1"/></cells>' +
                                '</rows>' +
                                '<rows>' +
                                    '<cells type="module"><content component="Module.Test1" text="test 1-2"/></cells>' +
                                '</rows>' +
                            '</content>' +
                        '</cells>' +
                    '</rows>' +
                    '<rows>' +
                        '<cells type="module"><content component="Module.Test1" text="test 1-3"/></cells>' +
                        '<cells type="module"><content component="Module.Test2" text="test 2-2"/></cells>' +
                        '<cells type="module"><content component="Module.Test2" text="test 2-3"/></cells>' +
                    '</rows>' +
                '</content>' +
            '</grid>');

        Actions.addGrid(testGrid);
        Manipulator.setIds(testGrid);

        return testGrid;
    },

    countRows: function(component) {
        try {
            return TestUtils.scryRenderedComponentsWithType(component, Row).length;
        } catch(e) {
            return 0;
        };
    },
    countSubGrids: function(component) {
        try {
            return TestUtils.scryRenderedComponentsWithType(component, SubGrid).length;
        } catch(e) {
            return 0;
        };
    },
    countModules: function(component) {
        try {
            return TestUtils.scryRenderedDOMComponentsWithClass(component, 'grid-cell-module').length;
        } catch(e) {
            return 0;
        };
    },
    countRowPlaceholders: function(component) {
        try {
            return TestUtils.scryRenderedDOMComponentsWithClass(component, 'grid-row-placeholder').length;
        } catch(e) {
            return 0;
        };
    },
    countCellPlaceholders: function(component) {
        try {
            return TestUtils.scryRenderedDOMComponentsWithClass(component, 'grid-cell-placeholder').length;
        } catch(e) {
            return 0;
        };
    },

    clearModulesCache: function() {
        var ModulesCache = require('../../../app/Grid/Components/ModulesCache.js');
        ModulesCache._cache ={};
    },

    getTextContent: function(component) {
        return component.getDOMNode().textContent;
    },

    renderIntoDocument: function(element) {
        var component = TestUtils.renderIntoDocument(element);
        this._componentsCache.push(component);
        return component;
    },

    unmountComponent: function(component){
        // used in unmountAllComponents, it's a copy of the same function in 
        // jasmine-react, but we cannot use it as it seems that we have in this
        // case many React instances that doesn't share mounted components
        if(component.isMounted()){
            return React.unmountComponentAtNode(component.getDOMNode().parentNode);
        } else {
            return false;
        }
    },

    unmountAllComponents: function() {
        for (var i = this._componentsCache.length - 1; i >= 0; i--) {
            var component = this._componentsCache[i];
            try {
                this.unmountComponent(component);
            } catch(e) {
                console.log('Unable to unmount component', component, e);
            }
        };
        this._componentsCache = [];
    },

};


module.exports = componentUtils;
