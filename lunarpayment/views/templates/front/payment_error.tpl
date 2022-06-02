{*
    Initialize the plugin code for use below.
*}
{assign var='pluginVendorCode' value='lunarpayment'}

{if $plugin_order_error == 1}
    <div class="error alert alert-danger">
        {l s='Unfortunately, an error occurred
     while processing the transaction.' mod={$pluginVendorCode} }<br/><br/>
        {if !empty($plugin_error_message) }
            {l s='ERROR : "' mod={$pluginVendorCode} }{l s={$plugin_error_message} mod={$pluginVendorCode} }{l s='"' mod={$pluginVendorCode} }
            <br/>
            <br/>

        {/if}

        {l s='Your order cannot be created. If you think this is an error, feel free to contact our' mod={$pluginVendorCode} }
        <a href="{$link->getPageLink('contact', true)|escape:'htmlall':'UTF-8'}">{l s='customer support team' mod={$pluginVendorCode} }</a>
    </div>
{/if}
