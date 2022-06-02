/// <reference types="cypress" />

'use strict';

import { PluginTestHelper } from './test_helper.js';

export var TestMethods = {

    /** Admin & frontend user credentials. */
    StoreUrl: (Cypress.env('ENV_ADMIN_URL').match(/^(?:http(?:s?):\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im))[0],
    AdminUrl: Cypress.env('ENV_ADMIN_URL'),
    RemoteVersionLogUrl: Cypress.env('REMOTE_LOG_URL'),

    /** Construct some variables to be used bellow. */
    ShopName: 'prestashop17',
    VendorName: 'lunar',
    OrderStatusForCapture: '',
    PaymentMethodAdminUrl: '/index.php?controller=AdminModules&configure=lunarpayment',
    ModulesAdminUrl: '/index.php?controller=AdminModules',
    OrdersPageAdminUrl: '/index.php/sell/orders',

    /**
     * Login to admin backend account
     */
    loginIntoAdminBackend() {
        cy.goToPage(this.AdminUrl);
        cy.loginIntoAccount('input[name=email]', 'input[name=passwd]', 'admin');
    },
    /**
     * Login to client|user frontend account
     */
    loginIntoClientAccount() {
        /**
         * Note
         * "/index.php?controller=authentication&back=my-account" may be an old uri
         * On Prestashop newer versions it redirect to "/login?&back=my-account"
         */
        cy.goToPage(this.StoreUrl + '/index.php?controller=authentication&back=my-account');
        cy.loginIntoAccount('input[id=field-email]', 'input[name=password]', 'client');
    },

    /**
     * Modify payment settings
     * @param {String} captureMode
     */
    changeCaptureMode(captureMode) {
        /** Go to payment method. */
        this.goToPageAndIgnoreWarning(this.PaymentMethodAdminUrl);

        /**
         * Get order statuses to be globally used.
         */
        this.getPaymentOrderStatuses();

        var vendorNameUppercase = this.VendorName.toUpperCase();

        /** Select capture mode. */
        cy.get(`#${vendorNameUppercase}_CHECKOUT_MODE`).select(captureMode);

        /** Save. */
        cy.get('#module_form_submit_btn').click();
    },

    /**
     * Make payment with specified currency and process order
     *
     * @param {String} currency
     * @param {String} paymentAction
     * @param {Boolean} partialAmount
     */
     payWithSelectedCurrency(currency, paymentAction, partialAmount = false) {
        /** Make an instant payment. */
        it(`makes a payment with "${currency}"`, () => {
            this.makePaymentFromFrontend(currency);
        });

        /** Process last order from admin panel. */
        it(`process (${paymentAction}) an order from admin panel`, () => {
            this.processOrderFromAdmin(paymentAction, partialAmount);
        });
    },

    /**
     * Make an instant payment
     * @param {String} currency
     */
    makePaymentFromFrontend(currency) {
        /** Go to store frontend. */
        cy.goToPage(this.StoreUrl);

        /** Change currency. */
        this.changeShopCurrency(currency);

        cy.wait(300);

        /**
         * Go to random product page.
         */
        var randomInt = PluginTestHelper.getRandomInt(/*max*/ 5);
        var productId = randomInt + 1; // product id > 0
        cy.goToPage(this.StoreUrl + `/index.php?id_product=${productId}&controller=product`);

        /** Add to cart. */
        cy.get('button.add-to-cart').click();

        /** Wait to add to cart. */
        cy.wait(2000);

        /** Go to checkout. */
        cy.goToPage(this.StoreUrl + '/index.php?controller=order');

        /** Continue. */
        cy.get('button[name="confirm-addresses"]', {timeout: 10000}).click();
        cy.wait(200);
        cy.get('button[name="confirmDeliveryOption"]', {timeout: 10000}).click();
        cy.wait(200);

        /** Choose payment method. */
        cy.get(`input[data-module-name*=${this.VendorName}]`).click();

        /** Check amount. */
        cy.get('div.cart-summary-line.cart-total .value').then($grandTotal => {
            var expectedAmount = PluginTestHelper.filterAndGetAmountInMinor($grandTotal, currency);
            cy.window().then(win => {
                expect(expectedAmount).to.eq(Number(win[this.VendorName + 'Payment'].amount));
            });
        });

        /** Agree Terms & Conditions. */
        cy.get('input[id="conditions_to_approve[terms-and-conditions]"]').click();

        /** Show popup. */
        cy.get(`#pay-by-${this.VendorName}`).click();

        /**
         * Fill in popup.
         */
         PluginTestHelper.fillAndSubmitPopup();

        cy.get('h3.h1.card-title', {timeout: 10000}).should('contain', 'Your order is confirmed');
    },

    /**
     * Process last order from admin panel
     * @param {String} paymentAction
     * @param {Boolean} partialAmount
     */
    processOrderFromAdmin(paymentAction, partialAmount = false) {
        /** Go to admin orders page. */
        this.goToPageAndIgnoreWarning(this.OrdersPageAdminUrl);

        PluginTestHelper.setPositionRelativeOn('#header_infos');
        PluginTestHelper.setPositionRelativeOn('.header-toolbar');

        /** Click on first (latest in time) order from orders table. */
        cy.get('table tbody tr').first().click();

        /**
         * Take specific action on order
         */
        this.paymentActionOnOrderAmount(paymentAction, partialAmount);
    },

    /**
     * Capture an order amount
     * @param {String} paymentAction
     * @param {Boolean} partialAmount
     */
     paymentActionOnOrderAmount(paymentAction, partialAmount = false) {
        switch (paymentAction) {
            case 'capture':
                cy.get('#update_order_status_new_order_status_id').select(this.OrderStatusForCapture);
                cy.get('.btn-primary.update-status').click();
            break;

            case 'refund':
                cy.get('.btn-action.partial-refund-display').click();

                var vendorNameFirstUpper = this.VendorName.charAt(0).toUpperCase() + this.VendorName.slice(1);

                /** Verify if refund is checked. */
                cy.get(`input#doRefund${vendorNameFirstUpper}`).should('have.attr', 'checked');

                /** If we got multiple products, be sure to select only one. */
                cy.get('input.refund-quantity').first().clear().type(1);
                cy.get('input[id*="cancel_product_amount"]').click();

                if (partialAmount) {
                    /**
                     * Put 8 major units to be refunded.
                     * Premise: any product must have price >= 8.
                     */
                    cy.get('input[id*="cancel_product_amount"]').clear().type(8);
                }
                /** Save. */
                cy.get('#cancel_product_save').click();
            break;

            case 'void':
                cy.get('#update_order_status_new_order_status_id').select('Canceled');
                cy.get('.btn-primary.update-status').click();
            break;
        }

        /** Check if success message. */
        cy.get('.alert.alert-success').should('be.visible');
    },

    /**
     * Change shop currency in frontend
     */
    changeShopCurrency(currency) {
        cy.get('button[aria-label="Currency dropdown"]').click();
        cy.get('ul[aria-labelledby="currency-selector-label"] li a').each($listLink => {
            if ($listLink.text().includes(currency)) {
                cy.get($listLink).click();
            }
        });
    },

    /**
     * Get paymnet order statuses from settings
     */
     getPaymentOrderStatuses() {
        var vendorNameUppercase = this.VendorName.toUpperCase();

        /** Get order status for capture. */
        cy.get(`#${vendorNameUppercase}_ORDER_STATUS > option[selected=selected]`).then($captureStatus => {
            this.OrderStatusForCapture = $captureStatus.text();
        });
    },

    /**
     * Get Shop & plugin versions and send log data.
     */
    logVersions() {
        /** Get framework version. */
        cy.get('#shop_version').then($frameworkVersion => {
            var frameworkVersion = ($frameworkVersion.text()).replace(/.*[^0-9.]/g, '');
            cy.wrap(frameworkVersion).as('frameworkVersion');
        });

        this.goToPageAndIgnoreWarning(this.ModulesAdminUrl);

        /** Get plugin version. */
        cy.get(`div[data-tech-name*=${this.VendorName}]`).invoke('attr', 'data-version').then($pluginVersion => {
            cy.wrap($pluginVersion).as('pluginVersion');
        });

        /** Get global variables and make log data request to remote url. */
        cy.get('@frameworkVersion').then(frameworkVersion => {
            cy.get('@pluginVersion').then(pluginVersion => {

                cy.request('GET', this.RemoteVersionLogUrl, {
                    key: frameworkVersion,
                    tag: this.ShopName,
                    view: 'html',
                    ecommerce: frameworkVersion,
                    plugin: pluginVersion
                }).then((resp) => {
                    expect(resp.status).to.eq(200);
                });
            });
        });
    },

    /**
     * Go to page & ignore token warning
     */
    goToPageAndIgnoreWarning(pageUri) {
        cy.goToPage(pageUri);
        /**
         * Accept token warning.
         * This warning show up even if we set the token on url.
         * So, we do not set it and click on the button.
         */
         cy.get(`a[href*="${pageUri}"]`, {timeout: 10000}).click();
    },

    /**
     * TEMPORARY ADDED BEGIN
     */
     enableThisModuleDisableOther() {
        this.goToPageAndIgnoreWarning(this.ModulesAdminUrl);
        cy.get('button[data-confirm_modal="module-modal-confirm-lunarpayment-enable"]', {timeout: 10000}).click({force: true});
        cy.wait(1000);

        /** Disable other. */
        // cy.get('a[href*="/action/disable/paylikepayment?"').closest('div').invoke('attr', 'style', 'display: block;');
        cy.get('div#module-modal-confirm-paylikepayment-disable').invoke('attr', 'style', 'display: block;');
        cy.get('a[href*="/action/disable/paylikepayment?"').click();
        cy.get('.modal-footer a[href*="/action/disable/paylikepayment?"').click();
    },
    disableThisModuleEnableOther() {
        this.goToPageAndIgnoreWarning(this.ModulesAdminUrl);
        // cy.get('a[href*="/action/disable/lunarpayment?"').closest('div').invoke('attr', 'style', 'display: block;');
        cy.get('div#module-modal-confirm-lunarpayment-disable').invoke('attr', 'style', 'display: block;');
        cy.get('a[href*="/action/disable/lunarpayment?"').click();
        cy.get('.modal-footer a[href*="/action/disable/lunarpayment?"').click();

        /** Enable other. */
        cy.get('button[data-confirm_modal="module-modal-confirm-paylikepayment-enable"]', {timeout: 10000}).click({force: true});
    },
    /**
     * TEMPORARY ADDED END
     */
}