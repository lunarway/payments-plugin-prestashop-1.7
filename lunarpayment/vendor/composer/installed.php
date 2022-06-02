<?php return array(
    'root' => array(
        'pretty_version' => '1.0.0',
        'version' => '1.0.0.0',
        'type' => 'prestashop-module',
        'install_path' => __DIR__ . '/../../',
        'aliases' => array(),
        'reference' => NULL,
        'name' => 'lunar/plugin-prestashop',
        'dev' => true,
    ),
    'versions' => array(
        'lunar/plugin-prestashop' => array(
            'pretty_version' => '1.0.0',
            'version' => '1.0.0.0',
            'type' => 'prestashop-module',
            'install_path' => __DIR__ . '/../../',
            'aliases' => array(),
            'reference' => NULL,
            'dev_requirement' => false,
        ),
        'paylike/php-api' => array(
            'pretty_version' => '1.0.5',
            'version' => '1.0.5.0',
            'type' => 'library',
            'install_path' => __DIR__ . '/../paylike/php-api',
            'aliases' => array(),
            'reference' => '85cd1fd04f98afd68b628735aad94add2f4c0223',
            'dev_requirement' => false,
        ),
    ),
);
