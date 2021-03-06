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
 * @author Martin Doyle
 */
define(["intern!object",
        "intern/chai!expect",
        "intern/chai!assert",
        "require",
        "alfresco/TestCommon"],
        function(registerSuite, expect, assert, require, TestCommon) {

   var browser;

   registerSuite({
      name: "NotificationService",

      setup: function() {
         browser = this.remote;
         return TestCommon.loadTestWebScript(this.remote, "/NotificationService", "NotificationService")
            .end();
      },

      beforeEach: function() {
         browser.end();
      },

      "Notification displays on button click": function() {
         return browser.findByCssSelector("#NOTIFICATION_BUTTON_SMALL")
            .click()
            .sleep(1000) // Simulate delay of notification appearing and user focusing on it
            .end()

         .findByCssSelector(".alfresco-notifications-AlfNotification__message")
            .isDisplayed()
            .then(function(notificationDisplayed) {
               assert.isTrue(notificationDisplayed, "Notification not displayed");
            });
      },

      "Notification hides after displaying": function() {
         return browser.setFindTimeout(5000)
            .waitForDeletedByCssSelector(".alfresco-notifications-AlfNotification__message");
      },

      "Topic publishes after notification hidden": function() {
         return browser.findAllByCssSelector(TestCommon.topicSelector("ALF_NOTIFICATION_DESTROYED", "publish", "any"))
            .then(function(elements) {
               assert.lengthOf(elements, 1, "Post-notification topic not published");
            });
      },

      "Post Coverage Results": function() {
         TestCommon.alfPostCoverageResults(this, browser);
      }
   });
});