var _ = require('lodash');
var jasmineReact = require('jasmine-react-helpers');
var React = require('react/addons');  // react + addons
var stringify = require('json-stable-stringify');
var TestUtils = React.addons.TestUtils;

var Actions = require('../../../app/Grid/Actions.js');
var Manipulator = require('../../../app/Grid/Manipulator.js');
var Modules = require('../../../app/Grid/Modules.js');
var Store = require('../../../app/Grid/Store.js');

var Cell = require('../../../app/Grid/Components/Cell.jsx');
var ModulesCache = require('../../../app/Grid/Components/ModulesCache.js');
var Placeholder = require('../../../app/Grid/Components/Placeholder.jsx');
var SubGrid = require('../../../app/Grid/Components/SubGrid.jsx');

var Utils = require('../../Utils.js');
var componentUtils = require('./Utils.js');


describe("Grid.Components.Cell", function() {
    var uniqueIdMock;

    // main grid and some cells, defined in beforeEach
    var testGrid;
    var moduleGridCell;
    var subGridCell;

    beforeEach(function(done) {
        // we want to start each test with a fresh list of grids
        Store.__removeAllGrids();

        // we mock the uniqueId function of lodash to know the value to expect
        uniqueIdMock = Utils.mockUniqueId();

        // reset the modules cache for every test
        componentUtils.clearModulesCache();

        // we add a grid with some content
        testGrid = componentUtils.makeTestGrid();
        moduleGridCell = testGrid.querySelector('cell[type=module]');
        subGridCell = testGrid.querySelector('cell[type=grid]');

        setTimeout(done, 0.01);
    });

    afterEach(function() {
        componentUtils.unmountAllComponents();
    });

    it("should access its main grid", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.getGrid()).toBe(testGrid);
    });

    it("should get its id", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.getNodeId()).toBe(subGridCell.getAttribute('id'));
    });

    it("should get the main grid name", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.getGridName()).toEqual('Test grid');
    });

    it("should get the design mode step", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.getDesignModeStep()).toEqual('disabled');

        Store.__private.setDesignModeStep('Test grid', 'enabled');
        expect(component.getDesignModeStep()).toEqual('enabled');
    });

    it("should know if it's in design mode", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.isInDesignMode()).toBe(false);

        Store.__private.setDesignModeStep('Test grid', 'enabled');
        expect(component.isInDesignMode()).toBe(true);
    });

    it("should get the type of a cell", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);

        expect(component.getType()).toEqual('grid');
        expect(component.isSubGrid()).toBe(true);
        expect(component.isModule()).toBe(false);
        expect(component.isPlaceholder()).toBe(false);

        element = React.createElement(Cell, {node: moduleGridCell});
        component = componentUtils.renderIntoDocument(element);

        expect(component.getType()).toEqual('module');
        expect(component.isSubGrid()).toBe(false);
        expect(component.isModule()).toBe(true);
        expect(component.isPlaceholder()).toBe(false);

        Manipulator.addPlaceholders(testGrid);
        Manipulator.setIds(testGrid);

        var gridCell = testGrid.querySelector('cell[type=placeholder]');
        element = React.createElement(Cell, {node: gridCell});
        component = componentUtils.renderIntoDocument(element);

        expect(component.getType()).toEqual('placeholder');
        expect(component.isSubGrid()).toBe(false);
        expect(component.isModule()).toBe(false);
        expect(component.isPlaceholder()).toBe(true);

    });

    it("should render a subgrid", function() {
        jasmineReact.spyOnClass(Cell, 'renderAsSubGrid').and.callThrough();

        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(jasmineReact.classPrototype(Cell).renderAsSubGrid.calls.count()).toEqual(1);

        // default relative size => flex-grow=1
        expect(component.getDOMNode().getAttribute('style')).toMatch(/\bflex-grow\s*:\s*1\b/);

        var subGrid = component.renderAsSubGrid();
        expect(TestUtils.isElementOfType(subGrid, SubGrid)).toBe(true);
        expect(subGrid.props.node).toBe(subGridCell);
    });

    it("should render a module in normal mode", function() {
        jasmineReact.spyOnClass(Cell, 'renderAsModule').and.callThrough();

        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);
        var domNode = component.getDOMNode();

        expect(jasmineReact.classPrototype(Cell).renderAsModule.calls.count()).toEqual(1);

        expect(domNode.tagName).toEqual('DIV');
        expect(domNode.classList.contains('grid-cell')).toBe(true);
        expect(domNode.classList.contains('grid-cell-module')).toBe(true);
        expect(domNode.classList.contains('grid-cell-module-dragging')).toBe(false);
        expect(domNode.classList.contains('grid-cell-module-focused')).toBe(false);

        var moduleContainer = domNode.children[0];
        expect(moduleContainer.tagName).toEqual('DIV');
        expect(moduleContainer.className).toEqual('module-container');
        expect(moduleContainer.children.length).toEqual(1);
        expect(moduleContainer.children[0].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].className).toEqual('module');

        // default relative size => flex-grow=1
        expect(domNode.getAttribute('style')).toMatch(/\bflex-grow\s*:\s*1\b/);

        // update the relativeSize to see if it's taken into account
        moduleGridCell.setAttribute('relativeSize', 2);
        component.forceUpdate();
        // new relative size of the node, check the rendered div
        expect(domNode.getAttribute('style')).toMatch(/\bflex-grow\s*:\s*2\b/);

        var module = component.renderAsModule();
        expect(TestUtils.isElementOfType(module, React.DOM.div)).toBe(true);
    });

    it("should render a module in design mode", function() {
        Store.__private.setDesignModeStep('Test grid', 'enabled');
        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);
        var domNode = component.getDOMNode();

        expect(domNode.tagName).toEqual('DIV');
        expect(domNode.classList.contains('grid-cell')).toBe(true);
        expect(domNode.classList.contains('grid-cell-module')).toBe(true);
        expect(domNode.classList.contains('grid-cell-module-dragging')).toBe(false);
        expect(domNode.classList.contains('grid-cell-module-focused')).toBe(false);

        var moduleContainer = domNode.children[0];
        expect(moduleContainer.tagName).toEqual('DIV');
        expect(moduleContainer.className).toEqual('module-holder-container');
        expect(moduleContainer.children.length).toEqual(1);
        expect(moduleContainer.children[0].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].className).toEqual('module-holder');
        expect(moduleContainer.children[0].children[0].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].children[0].className).toEqual('module-cover');
        expect(moduleContainer.children[0].children[1].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].children[1].className).toEqual('module-container');
        expect(moduleContainer.children[0].children[1].children[0].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].children[1].children[0].className).toEqual('module');

        // default relative size => flex-grow=1
        expect(domNode.getAttribute('style')).toMatch(/\bflex-grow\s*:\s*1\b/);

        // update the relativeSize to see if it's taken into account
        moduleGridCell.setAttribute('relativeSize', 2);
        component.forceUpdate();
        // new relative size of the node, check the rendered div
        expect(domNode.getAttribute('style')).toMatch(/\bflex-grow\s*:\s*2\b/);
    });

    it("should render a placeholder", function() {
        jasmineReact.spyOnClass(Cell, 'renderAsPlaceholder').and.callThrough();

        Manipulator.addPlaceholders(testGrid);
        var placeholderGridCell = testGrid.querySelector('cell[type=placeholder]');
        var element = React.createElement(Cell, {node: placeholderGridCell});
        var component = componentUtils.renderIntoDocument(element);
        var domNode = component.getDOMNode();

        expect(jasmineReact.classPrototype(Cell).renderAsPlaceholder.calls.count()).toEqual(1);

        expect(domNode.tagName).toEqual('DIV');
        expect(domNode.classList.contains('grid-cell')).toBe(true);
        expect(domNode.classList.contains('grid-cell-placeholder')).toBe(true);
        expect(domNode.classList.contains('grid-cell-module-dragging')).toBe(false);

        // no specific style defined
        expect(domNode.getAttribute('style')).toBe(null);

        var placeholder = component.renderAsPlaceholder();
        expect(TestUtils.isElementOfType(placeholder, Placeholder)).toBe(true);
        expect(placeholder.props.node).toBe(placeholderGridCell);
    });

    it("should attach the module component after being mounted", function(done) {
        jasmineReact.spyOnClass(Cell, '_attachExternalNode').and.callThrough();
        jasmineReact.spyOnClass(Cell, '_detachExternalNode').and.callThrough();

        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);

        // leave some time to render the component
        setTimeout(function() {
            expect(_.keys(ModulesCache._cache).length).toEqual(1);
            var cellProto = jasmineReact.classPrototype(Cell)
            expect(cellProto._attachExternalNode.calls.count()).toEqual(1);
            expect(cellProto._attachExternalNode.calls.argsFor(0)[1]).toEqual('module-container');
            expect(cellProto._detachExternalNode.calls.count()).toEqual(0);

            done();
        }, 0.01);
    });

    it("should detach/attach the module component during update", function(done) {
        jasmineReact.spyOnClass(Cell, '_attachExternalNode').and.callThrough();
        jasmineReact.spyOnClass(Cell, '_detachExternalNode').and.callThrough();

        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);

        // leave some time to render the component
        setTimeout(function() {

            component.forceUpdate();

            // leave some time to update the component
            setTimeout(function() {
                expect(_.keys(ModulesCache._cache).length).toEqual(1);
                var cellProto = jasmineReact.classPrototype(Cell);
                expect(cellProto._attachExternalNode.calls.count()).toEqual(2);  // includes initial
                expect(cellProto._attachExternalNode.calls.argsFor(0)[1]).toEqual('module-container');
                expect(cellProto._attachExternalNode.calls.argsFor(1)[1]).toEqual('module-container');
                expect(cellProto._detachExternalNode.calls.count()).toEqual(1);
                expect(cellProto._detachExternalNode.calls.argsFor(0)[0].classList.contains('module-container')).toBe(true);

                done();

            }, 0.01);

        }, 0.01);
    });

    it("should accept to attach a module only if it's a module cell", function() {
        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);
        expect(component.canHoldExternalNodes()).toBe(true);

        element = React.createElement(Cell, {node: subGridCell});
        component = componentUtils.renderIntoDocument(element);
        expect(component.canHoldExternalNodes()).toBe(false);

        Manipulator.addPlaceholders(testGrid);
        Manipulator.setIds(testGrid);
        var gridCell = testGrid.querySelector('cell[type=placeholder]');
        element = React.createElement(Cell, {node: gridCell});
        component = componentUtils.renderIntoDocument(element);
        expect(component.canHoldExternalNodes()).toBe(false);
    });

    it("should only return the module to attach when not in design mode", function() {
        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);

        // not in design mode, we should get a module
        var moduleContainer = component.getExternalNode(ModulesCache.moduleContainerClassName);
        expect(moduleContainer.tagName).toEqual('DIV');
        expect(moduleContainer.className).toEqual('module-container');
        expect(moduleContainer.children.length).toEqual(1);
        expect(moduleContainer.children[0].tagName).toEqual('DIV');
        expect(moduleContainer.children[0].className).toEqual('module');

        // faking going to design mode
        spyOn(component, "isInDesignMode").and.returnValue('true');

        // in design mode, we should get nothing when asking for the module
        moduleContainer = component.getExternalNode(ModulesCache.moduleContainerClassName);
        expect(moduleContainer).toBe(undefined);

    });

    it("should only return the module holder to attach when in design mode", function() {
        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);

        // not in design mode, we should get a module
        var holderContainer = component.getExternalNode(ModulesCache.holderContainerClassName);
        expect(holderContainer).toBe(undefined);

        // faking going to design mode
        spyOn(component, "isInDesignMode").and.returnValue('true');

        // in design mode, we should get nothing when asking for the module
        holderContainer = component.getExternalNode(ModulesCache.holderContainerClassName);
        expect(holderContainer.tagName).toEqual('DIV');
        expect(holderContainer.className).toEqual('module-holder-container');
        expect(holderContainer.children.length).toEqual(1);
        expect(holderContainer.children[0].tagName).toEqual('DIV');
        expect(holderContainer.children[0].className).toEqual('module-holder');
        expect(holderContainer.children[0].children[0].tagName).toEqual('DIV');
        expect(holderContainer.children[0].children[0].className).toEqual('module-cover');
        expect(holderContainer.children[0].children[1].tagName).toEqual('DIV');
        expect(holderContainer.children[0].children[1].className).toEqual('module-container');
        expect(holderContainer.children[0].children[1].children[0].tagName).toEqual('DIV');
        expect(holderContainer.children[0].children[1].children[0].className).toEqual('module');

    });

    it("should not return a node to attach if it's not a module grid", function() {
        var element = React.createElement(Cell, {node: subGridCell});
        var component = componentUtils.renderIntoDocument(element);

        var container = component.getExternalNode(ModulesCache.moduleContainerClassName);
        expect(container).toBe(undefined);
        container = component.getExternalNode(ModulesCache.holderContainerClassName);
        expect(container).toBe(undefined);

        Manipulator.addPlaceholders(testGrid);
        Manipulator.setIds(testGrid);
        var gridCell = testGrid.querySelector('cell[type=placeholder]');
        element = React.createElement(Cell, {node: gridCell});
        component = componentUtils.renderIntoDocument(element);

        var container = component.getExternalNode(ModulesCache.moduleContainerClassName);
        expect(container).toBe(undefined);
        container = component.getExternalNode(ModulesCache.holderContainerClassName);
        expect(container).toBe(undefined);

    });

    it("should not return a node to attach if it's not a valid className", function() {
        var element = React.createElement(Cell, {node: moduleGridCell});
        var component = componentUtils.renderIntoDocument(element);

        var container = component.getExternalNode('foo');
        expect(container).toBe(undefined);

        container = component.getExternalNode(null);
        expect(container).toBe(undefined);

        container = component.getExternalNode();
        expect(container).toBe(undefined);
    });

    it("should react when a module get/loose the focus", function(done) {
        jasmineReact.spyOnClass(Cell, 'onFocusModuleCell').and.callThrough();
        jasmineReact.spyOnClass(Cell, 'onNavigateTo').and.callThrough();
        jasmineReact.spyOnClass(Cell, 'onNavigateFrom').and.callThrough();

        var cellProto = jasmineReact.classPrototype(Cell)

        spyOn(Actions, 'focusModuleCell').and.callThrough();

        var element1 = React.createElement(Cell, {node: moduleGridCell});
        var component1 = componentUtils.renderIntoDocument(element1);
        var moduleGridCell2 = testGrid.querySelectorAll('cell[type=module]')[1];
        var element2 = React.createElement(Cell, {node: moduleGridCell2});
        var component2 = componentUtils.renderIntoDocument(element2);

        // we need to be in the real dome
        var domNode1 = component1.getDOMNode();
        var domNode2 = component2.getDOMNode();
        // need to be really displayed to receive the focus
        domNode1.parentNode.style.display = 'block';
        domNode2.parentNode.style.display = 'block';
        document.body.appendChild(domNode1.parentNode);
        document.body.appendChild(domNode2.parentNode);

        // set the focus on the first cell
        React.addons.TestUtils.Simulate.focus(domNode1);

        // leave time for events to be catched
        setTimeout(function() {

            // the first cell should have the focus
            expect(component1.hasFocus()).toBe(true, 'a1');
            expect(component2.hasFocus()).toBe(false, 'a2');

            expect(cellProto.onFocusModuleCell).toHaveBeenCalled();

            expect(cellProto.onNavigateTo).toHaveBeenCalled();
            expect(cellProto.onNavigateTo.calls.first().args).toEqual(['Test grid', moduleGridCell.getAttribute('id')]);
            expect(cellProto.onNavigateFrom).not.toHaveBeenCalled();

            expect(Actions.focusModuleCell).toHaveBeenCalled();

            expect(domNode1.classList.contains('grid-cell-module-focused')).toBe(true);
            expect(domNode2.classList.contains('grid-cell-module-focused')).toBe(false);

            cellProto.onFocusModuleCell.calls.reset();
            cellProto.onNavigateTo.calls.reset();
            cellProto.onNavigateFrom.calls.reset();
            Actions.focusModuleCell.calls.reset();

            // set focus on the second cell
            React.addons.TestUtils.Simulate.focus(domNode2);
            setTimeout(function() {

                // the second cell should have the focus
                expect(component1.hasFocus()).toBe(false, 'd1');
                expect(component2.hasFocus()).toBe(true, 'd2');

                expect(cellProto.onFocusModuleCell).toHaveBeenCalled();

                expect(cellProto.onNavigateTo).toHaveBeenCalled();
                expect(cellProto.onNavigateTo.calls.first().args).toEqual(['Test grid', moduleGridCell2.getAttribute('id')]);
                expect(cellProto.onNavigateFrom).toHaveBeenCalled();
                expect(cellProto.onNavigateFrom.calls.first().args).toEqual(['Test grid', moduleGridCell.getAttribute('id')]);

                expect(Actions.focusModuleCell).toHaveBeenCalled();

                expect(domNode1.classList.contains('grid-cell-module-focused')).toBe(false);
                expect(domNode2.classList.contains('grid-cell-module-focused')).toBe(true);

                cellProto.onFocusModuleCell.calls.reset();
                cellProto.onNavigateTo.calls.reset();
                cellProto.onNavigateFrom.calls.reset();
                Actions.focusModuleCell.calls.reset();


                // add a focusable element in the first cell
                var link = domNode1.querySelector('a');
                if (!link) {
                    link = document.createElement('a');
                    link.setAttribute('href', '#');
                    link.setAttribute('tabIndex', 10);
                    link.innerHTML = 'hello';
                    domNode1.querySelector('span').appendChild(link);
                }

                // then focus the link

                // cannot use: `React.addons.TestUtils.Simulate.focus(link);`
                // because the focus happems in another react root, so the
                // simulate doesn't handle it
                link.focus();

                // note: the `toHaveBeenCalled` tests will fail if the test window
                // doesn't have the focus.

                setTimeout(function() {
                    // the first cell should have the focus back
                    expect(component1.hasFocus()).toBe(true, 'g1');
                    expect(component2.hasFocus()).toBe(false, 'g2');

                    expect(cellProto.onFocusModuleCell).toHaveBeenCalled();

                    expect(cellProto.onNavigateTo).toHaveBeenCalled();
                    expect(cellProto.onNavigateTo.calls.first().args).toEqual(['Test grid', moduleGridCell.getAttribute('id')]);
                    expect(cellProto.onNavigateFrom).toHaveBeenCalled();
                    expect(cellProto.onNavigateFrom.calls.first().args).toEqual(['Test grid', moduleGridCell2.getAttribute('id')]);

                    expect(Actions.focusModuleCell).toHaveBeenCalled();

                    expect(domNode1.classList.contains('grid-cell-module-focused')).toBe(true);
                    expect(domNode2.classList.contains('grid-cell-module-focused')).toBe(false);

                    // tell jasmine we're done
                    done();

                }, 0.01);
            }, 0.01);
        }, 0.01);
    });

});