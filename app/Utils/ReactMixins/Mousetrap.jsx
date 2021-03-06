/** @jsx React.DOM */
var React = require('react/addons');  // react + addons
var Mousetrap = require('br-mousetrap');

var Exceptions = require('../Exceptions.js');


/**
 * A mixin to be used by components that need to react to keyboard events
 *
 * Each component using this mixin can use these methods
 *
 *  - `bindShortcut`
 *  - `unbindShortcut`
 *  - `unbindAllShortcuts`
 *
 * @mixin
 * @memberOf module:Utils.ReactMixins
 * @summary A mixin to be used by components that need to react to document events
 */
var MousetrapMixin = {

    statics: {
        Exceptions: {
            /**
             * Exception raised when an inconsistency occurs
             * This is a subclass of "Error"
             * @class
             *
             * @param {string} [message=Inconsistency detected] - The raised message
             *
             * @property {string} name - The name of the exception: "Inconsistency"
             * @property {string} message - The message passed when the exception was raised, or a default value
             */
            Inconsistency: function Inconsistency(message) {
                this.name = 'Inconsistency';
                this.message = message || 'Inconsistency detected';
            },
        },
    },

    /**
     * Bind a keyboard shortcut to a callback
     *
     * @param  {String} key - The string representation of the shortcut to catch
     * @param  {Function} callback - The callback to call when the shortcut is catched
     */
    bindShortcut: function (key, callback) {
        if (!this._mousetrapBindings) { this._mousetrapBindings = {}; }
        if (typeof this._mousetrapBindings[key] !== 'undefined') {
            throw new MousetrapMixin.statics.Exceptions.Inconsistency("The shortcut <" + key + "> is already defined for this component");
        }
        Mousetrap.bind(key, callback);
        this._mousetrapBindings[key] = callback;
    },

    /**
     * Unbind the shortcut (given by its key) from its registered callback
     *
     * @param  {String} key - The string representation of the shortcut to unbind
     */
    unbindShortcut: function (key) {
        if (!this._mousetrapBindings) { return }
        if (typeof this._mousetrapBindings[key] === 'undefined') {
            throw new MousetrapMixin.statics.Exceptions.Inconsistency("The shortcut <" + key + "> is not defined for this component");
        }
        Mousetrap.unbind(key);
        delete(this._mousetrapBindings[key]);
    },

    /**
     * Unbind all shortcuts associated to this component
     */
    unbindAllShortcuts: function () {
        if (!this._mousetrapBindings) { return }
        for (var key in this._mousetrapBindings) {
            Mousetrap.unbind(this._mousetrapBindings[key]);
        }
        this._mousetrapBindings = {};
    },

    /**
     * When the component is unmounted, unbind all its associated shortcuts
     */
    componentWillUnmount: function () {
        this.unbindAllShortcuts();
    }
};

// Exceptions must be based on the Error class
Exceptions.normalize(MousetrapMixin.statics.Exceptions);

module.exports = MousetrapMixin;