<?php
/**
 *
 * @author    Lunar <support@lunar.app>
 * @copyright Copyright (c) permanent, Lunar
 * @license   Addons PrestaShop license limitation
 * @link      https://lunar.app
 *
 */

namespace Lunar;

/**
 * Class Card
 * @package Lunar
 * Handles card operations.
 *
 */
if ( ! class_exists( 'Lunar\\Card' ) ) {
	class Card {
		/**
		 * Fetches information about a card
		 *
		 * @link https://github.com/paylike/api-docs#create-a-transaction
		 *
		 * @param $cardId
		 *
		 * @return int|mixed
		 */
		public static function fetch( $cardId ) {
			$adapter = Client::getAdapter();
			if ( ! $adapter ) {
				// trigger_error( 'Adapter not set!', E_USER_ERROR );
				return array( 'error' => 1, 'message' => "Adapter not set!" );
			}

			return $adapter->request( 'cards/' . $cardId, $data = null, $httpVerb = 'get' );
		}
	}
}
