# Prestashop plugin for Lunar
The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

## Supported Prestashop versions

*The plugin has been tested with most versions of Prestashop at every iteration. We recommend using the latest version of Prestashop, but if that is not possible for some reason, test the plugin with your Prestashop version and it would probably function properly.*



## Installation
Once you have installed Prestashop, follow these simple steps:
1. Signup at [lunar.app](https://lunar.app) (it’s free)
1. Create an account
1. Create an app key for your Prestashop website
1. Log in as administrator and click "Modules" from the left menu and then upload it clicking "UPLOAD A MODULE" form the top.
2. Click the "Configure" button when done installing.
3. Add the Public and App key that you can find in your Lunar account and enable the plugin and click save from the bottom.


## One Page Supercheckout compatibility patch
* Last tested on: *One Page Supercheckout v6.0.9*

In order to enable compatibility feature provided by our module, please change the content of the following files as described below:
---> File: prestashop_root/modules/supercheckout/views/js/front/supercheckout.js
1. find line `if ($('input:radio[name="payment_method"]:checked').hasClass('binary')) {`:
2. add the following code snippet before:
```php
// Start: Changes for LUNAR PAYMENT MODULE
if (payment_module_name == 'lunarpayment') {
    lunarPayment.init();
    lunarPayment.pay();
    hide_progress();
    $("html, body").animate({scrollTop: $("#hosted-fields-form").offset().top}, "fast");
    return;
}
// END: Changes for LUNAR PAYMENT MODULE
```

## Updating settings
Under the extension settings, you can:
 * Update the payment method text in the payment gateways list
 * Update the payment method description in the payment gateways list
 * Update the title that shows up in the payment popup
 * Update the popup description, choose whether you want to show the popup  (the cart contents will show up instead)
 * Add public & app keys
 * Change the capture type (Instant/Manual via Lunar Tool)
 * Change the status of the order which is going to trigger a capture in delayed mode.


 ## Refunding, voiding and capturing
 * To `Refund` an order make sure you checked the "Refund Lunar" checkbox durring the default Prestashop procedure for Partial Refund. Standard Refund and Return Product procedures also have this feature only for Prestashop version >= 1.7.7.
 Note: If for some reason the Refund procedure via Lunar fails, you will be notified and manual action will be required in your online Lunar Tool account.
 * To `Void` an order move the order status to "Canceled".
 * To `Capture` an order in delayed mode, use the status set in Lunar module settings (move the order to that status).

 * For Prestashop < 1.7.7 you can procede capture, void and refund actions via Lunar toolbox also.

 ## Advanced
 Due to the floating point precision issue with some numbers, it is recommended to have the bcmath extension installed.

 ## Changelog
#### 1.0.0:
- Initial commit
