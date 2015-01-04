/** @jsx React.DOM */
var React = require('react/addons');  // react + addons


/**
 * A mixin to be used by components that want to attach an external dom node to
 * their react one.
 *
 * The 
 *
 * Each component using this mixin should provide the two methods below:
 *
 *  - `canHoldExternalNodes`
 *  - `getExternalNode`
 *
 * And a array `externalNodesClassNames`
 *
 * @mixin
 * @memberOf module:Grid.Components.Mixins
 * @summary A mixin to help components attaching an external dom node to their react one.
 */
var NodesHolder = {

    /**
     * The list of classNames of dom nodes to attach/detach.
     *
     * For each class, the `getExternalNode` method will be called in order, and
     * the returned node will be attached when the react component will be ready.
     *
     * And then, just before an update or unmount of the react component, the
     * `getExternalNode` method will be called for each class, in reverse order,
     * to unmount the nodes if they are not present.
     *
     * @abstract
     *
     * @alias module:Grid.Components.Mixins.NodesHolder.externalNodesClassNames
     *
     * @type {Array}
     */

    //The array to override must not include the prefix `_`
    _externalNodesClassNames: [],

    /**
     * Method to set in the component using this mixin to return if its state allows
     * it to handle external nodes
     *
     * The method to override must not include the prefix `_`
     *
     * @abstract
     *
     * @alias module:Grid.Components.Mixins.NodesHolder.canHoldExternalNode()
     *
     * @return {boolean} - `true` if the component can handle external nodes, or `false` if not
     */

     //The method to override must not include the prefix `_`
    _canHoldExternalNodes: function() {},


    /**
     * Method to set in the component using this mixin to return the node to attach
     * for the given className. The node is supposed to have the given className
     * as one of its CSS classes. If not, it will be added when attached (because
     * it's used to find the node to detach later)
     *
     * If nothing is returned, no node will be attached for this class.
     *
     * @abstract
     *
     * @alias module:Grid.Components.Mixins.NodesHolder.getExternalNode()
     *
     * @return {DomMode|nothing} - The dom node to insert, or nothing
     */

     //The method to override must not include the prefix `_`
    _getExternalNode: function(className) {},

    /**
     * Will attach some dom nodes to the actual react dom node
     */
    attachExternalNodes: function() {
        if (this.canHoldExternalNodes()) {
            var domNode = this.getDOMNode();

            for (var i = 0; i < this.externalNodesClassNames.length; i++) {
                var className = this.externalNodesClassNames[i];
                var externalNode = this.getExternalNode(className);
                if (externalNode) {
                    if (!externalNode.classList.contains(className)) {
                        externalNode.add(className);
                    }
                    domNode.appendChild(externalNode);
                }
            }
        }
    },

    /**
     * Will detach some dom nodes from the actual react dom node
     */
    detachExternalNodes: function() {
        if (this.canHoldExternalNodes()) {
            var domNode = this.getDOMNode();

            for (var i = this.externalNodesClassNames.length - 1; i >= 0; i--) {
                var externalNode = domNode.querySelector(':scope > .' + this.externalNodesClassNames[i]);
                if (externalNode) {
                    domNode.removeChild(externalNode);
                }
            }
        }
    },

    /**
     * Detach external nodes before unmounting the react component
     */
    componentWillUnmount: function() {
        this.detachExternalNodes();
    },

    /**
     * Attach external nodes after mounting the react component
     */
    componentDidMount: function() {
        this.attachExternalNodes();
    },

    /**
     * Detach external nodes before updating the react component
     */
    componentWillUpdate: function() {
        this.detachExternalNodes();
    },

    /**
     * Attach external nodes after updating the react component
     */
    componentDidUpdate: function() {
        this.attachExternalNodes();
    },

};

module.exports = NodesHolder;
