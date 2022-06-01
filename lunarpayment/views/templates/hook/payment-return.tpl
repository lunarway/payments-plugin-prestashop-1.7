{*
    Initialize the plugin code for use below.
*}
{assign var='pluginVendorCode' value='lunarpayment' }

{if $lunar_order.valid == 1}
    <div class="conf alert alert-success">
        {l s='Congratulations, your payment has been approved' mod={$pluginVendorCode} }</div>
    </div>
{else}
    <div class="error alert alert-danger">
        {l s='Unfortunately, an error occurred while processing the transaction.' mod={$pluginVendorCode} }<br/><br/>
        {l s='We noticed a problem with your order. If you think this is an error, feel free to contact our' mod={$pluginVendorCode} }
        <a href="{$link->getPageLink('contact', true)|escape:'htmlall':'UTF-8'}">{l s='customer support team' mod={$pluginVendorCode} }</a>.
    </div>
{/if}
