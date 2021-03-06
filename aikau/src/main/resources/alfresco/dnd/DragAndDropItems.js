/**
 * Copyright (C) 2005-2015 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This widget allows an array of [items]{@link module:alfresco/dnd/DragAndDropItems#items} to 
 * be rendered which can be dragged and dropped (e.g. onto a [DragAndDropTargetControl]{@link module:alfresco/form/controls/DragAndDropTargetControl}).
 * 
 * @module alfresco/dnd/DragAndDropItems
 * @extends external:dijit/_WidgetBase
 * @mixes external:dojo/_TemplatedMixin
 * @mixes module:alfresco/core/ObjectProcessingMixin
 * @mixes module:alfresco/core/Core
 * @author Dave Draper
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase", 
        "dijit/_TemplatedMixin",
        "alfresco/core/CoreWidgetProcessing",
        "alfresco/core/ObjectProcessingMixin",
        "dojo/text!./templates/DragAndDropItems.html",
        "alfresco/core/Core",
        "alfresco/dnd/Constants",
        "dojo/dnd/Source",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/on",
        "dojo/string",
        "dojo/dom-construct",
        "dojo/dom-class"], 
        function(declare, _Widget, _Templated, CoreWidgetProcessing, ObjectProcessingMixin, template, AlfCore, Constants, 
                 Source, lang, array, on, stringUtil, domConstruct, domClass) {
   
   return declare([_Widget, _Templated, CoreWidgetProcessing, ObjectProcessingMixin, AlfCore], {
      
      /**
       * An array of the CSS files to use with this widget.
       * 
       * @instance
       * @type {Array}
       */
      cssRequirements: [{cssFile:"./css/DragAndDropItems.css"}],
      
      /**
       * The HTML template to use for the widget.
       * @instance
       * @type {String}
       */
      templateString: template,
      
      /**
       * @instance
       * @type {boolean}
       * @default false
       */
      dragWithHandles: false,
      
      /**
       * Creates a palette of items that can be dragged (and dropped).
       * 
       * @instance
       */
      postCreate: function alfresco_dnd_DragAndDropItems__postCreate() {
         // Listen for items that are selected through key presses so that the currently selected item
         // can be inserted into a drop target when the drop target is actioned by the keyboard
         on(this.paletteNode, Constants.itemSelectedEvent, lang.hitch(this, this.onItemSelected));

         this.sourceTarget = new Source(this.paletteNode, {
            copyOnly: true,
            selfCopy: false,
            creator: lang.hitch(this, this.creator),
            withHandles: this.dragWithHandles
         });
         this.sourceTarget.insertNodes(false, this.items);

         this.alfSubscribe(Constants.requestItemToAddTopic, lang.hitch(this, this.onItemToAddRequest));
      },

      /**
       * Handles the selection of an item. When an item is selected it will returned as the item to
       * insert into a drag target when requested.
       *
       * @instance
       * @param {object} evt The selection event
       */
      onItemSelected: function alfresco_dnd_DragAndDropItems__onItemToAddRequest(evt) {
         if (evt && evt.target && evt.target.parentNode)
         {
            var item = this.sourceTarget.getItem(evt.target.parentNode.id);
            if (item)
            {
               this._selectedItem = item;
               array.forEach(this.sourceTarget.getAllNodes(), function(node) {
                  domClass.remove(node.firstChild, "selected");
               });
               domClass.add(evt.target, "selected");
            }
         }
      },

      /**
       * Handles requests to provide an item to insert into a [DragAndDropTarget]{@link module:alfresco/dnd/DragAndDropTarget}
       * 
       * @instance
       */
      onItemToAddRequest: function alfresco_dnd_DragAndDropItems__onItemToAddRequest(payload) {
         if (payload.promise && typeof payload.promise.resolve === "function")
         {
            if (this._selectedItem)
            {
               payload.promise.resolve({
                  item: lang.clone(this._selectedItem.data)
               });
            }
         }
      },
      
      /**
       * The widgets model to render as a drag-and-drop item.
       *
       * @instance
       * @type {array}
       */
      widgets: [
         {
            name: "alfresco/dnd/DragAndDropItem",
            config: {
               iconClass: "{iconClass}",
               title: "{title}"
            }
         }
      ],

      /**
       * Handles the creation of drag and drop avatars. This could check the supplied hint parameter
       * to see if an avatar is required, but since the source doesn't allow self-copying and is not
       * a target in itself then this is not necessary.
       * 
       * @instance
       * @param {object} item The configuration for the dragged item.
       */
      creator: function alfresco_dnd_DragAndDropItems__creator(item, hint) {
         // jshint unused: false
         var node = domConstruct.create("div");         
         var clonedItem = lang.clone(item);
         this.currentItem = {};
         this.currentItem.title = clonedItem.label || "";
         this.currentItem.iconClass = clonedItem.iconClass || "";
         var widgetModel = lang.clone(this.widgets);
         this.processObject(["processCurrentItemTokens"], widgetModel);
         this.processWidgets(widgetModel, node);
         return {node: node, data: clonedItem, type: clonedItem.type};
      },
      
      /**
       * The array of items to render as draggable entities. Each item should have a type array (indicating
       * what targets it can be dropped onto), a label (to indicate its purpose) and a value (which can
       * be any complex object).
       * 
       * @instance
       * @type {array}
       * @default null
       */
      items: null
   });
});