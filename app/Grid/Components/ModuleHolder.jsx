/** @jsx React.DOM */
var _ = require('lodash');
var React = require('react/addons');  // react + addons
var stringify = require('json-stable-stringify');


var Actions = require('../Actions.js');
var ModulesCache = require('./ModulesCache.js');
var NodesHolderMixin = require('./Mixins/NodesHolder.jsx');


/**
 * This react component will hold a module in design mode, managing dragging, to
 * let the modules components strictly independent of the grid system.
 *
 * The hold module is not rendered as a child but detached/attached to this react
 * component dom node before/after mouting and updating, to avoid rerendering the
 * module at all costs. This is done by {@link module:Grid.Components.Mixins.NodesHolder NodesHolderMixin}
 *
 * @namespace
 *
 * @memberOf module:Grid.Components
 *
 * @summary A component to hold a module in design mode
 */
var ModuleHolder = {

    mixins: [
        NodesHolderMixin,
    ],

    /**
     * The type of node that can be attached to the current react component
     * dom node (managed by {@link module:Grid.Components.Mixins.NodesHolder NodesHolderMixin}):
     * - a module
     *
     * @type {Array}
     */
    externalNodesClassNames: [
        ModulesCache.moduleContainerClassName
    ],

    /**
     * Tell {@link module:Grid.Components.Mixins.NodesHolder NodesHolderMixin}
     * that this react component will always be able to hold a module.
     *
     * @return {boolean} - `true`
     */
    canHoldExternalNodes: function() {
        return true;
    },

    /**
     * Return the module to attach to the current react component dom node.
     *
     * It's take from the {@link module:Grid.Components.ModulesCache ModulesCache} module
     *
     * @param  {string} className - The class name of the dom node to return
     * @return {DomNode} - The module dom node
     */
    getExternalNode: function(className) {
        if (className == ModulesCache.moduleContainerClassName) {
            return ModulesCache.getModuleComponent(null, this.props.uniqueKey);
        };
    },

    /**
     * Call {@link module:Grid.Actions.startDragging startDragging} action when the drags of
     * the dom node starts
     *
     * @param  {event} event - The dragStart event
     */
    onDragStart: function(event) {
        Actions.startDragging(this.props.gridName, this.props.gridCell);
    },

    /**
     * Render the module holder, as a simple div with drag attributes/events, and
     * as a child, a div used as a cover over the module (attached via
     * {@link module:Grid.Components.Mixins.NodesHolder NodesHolderMixin}) to 
     * drag the dom node without any risk of interacting with the module content
     */
    render: function() {
        return <div className='module-holder'
                    draggable='true'
                    onDragStart={this.onDragStart}>
                    <div className="module-cover"/>
                </div>;
    }

}

module.exports = ModuleHolder = React.createClass(ModuleHolder);