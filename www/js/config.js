angular.module('starter.config', [])
//chrome://settings/cookiess
.constant('DB_CONFIG', {
    name: 'DB',
    tables: [
         {
            name: 'social_comment_poi',
            columns: [
                {name: 'social_comment_id', type: 'integer primary key'},
                {name: 'timestamp', type: 'datetime DEFAULT CURRENT_TIMESTAMP'},
                {name: 'user', type: 'text NULL'},
                {name: 'comment', type: 'text NULL'},
                {name: 'rating', type: 'integer'},
                {name: 'item_id', type: 'integer NOT NULL'},
                {name: 'sent', type: 'integer DEFAULT 0'}

            ]
        },
        {
            name: 'social_comment_route',
            columns: [
                {name: 'social_comment_id', type: 'integer primary key'},
                {name: 'timestamp', type: 'datetime DEFAULT CURRENT_TIMESTAMP'},
                {name: 'user', type: 'text NULL'},
                {name: 'comment', type: 'text NULL'},
                {name: 'rating', type: 'integer'},
                {name: 'item_id', type: 'integer NOT NULL'},
                {name: 'sent', type: 'integer DEFAULT 0'}

            ]
        },
        {
            name: 'social_comment_event',
            columns: [
                {name: 'social_comment_id', type: 'integer primary key'},
                {name: 'timestamp', type: 'datetime DEFAULT CURRENT_TIMESTAMP'},
                {name: 'user', type: 'text NULL'},
                {name: 'comment', type: 'text NULL'},
                {name: 'rating', type: 'integer'},
                {name: 'item_id', type: 'integer NOT NULL'},
                {name: 'sent', type: 'integer DEFAULT 0'}

            ]
        },
        {
            name: 'favorite',
            columns: [
                {name: 'favorite_id', type: 'integer primary key'},
                {name: 'type', type: 'integer NOT NULL'},
                {name: 'item_id', type: 'integer NOT NULL'},
                {name: 'visited', type: 'boolean DEFAULT 0'},
                {name: 'timestamp', type: 'datetime DEFAULT CURRENT_TIMESTAMP'}
            ]
        },

        {
            name: 'configuration',
            columns: [
                {name: 'config_id', type: 'integer primary key'},
                {name: 'server_url', type: 'text NOT NULL'},
                {name: 'app_Lang', type: 'text NOT NULL'},
                {name: 'fileName', type: 'text NOT NULL'},
                {name: 'version', type: 'text NOT NULL'},
                {name: 'app_directory', type: 'text NOT NULL'}
            ]
        }
    ]
})

.constant('itemsConfig', {
    poiType: '1',
    routeType: '2',
    restaurantType: '3',
    pubType: '4',
    accommodationType: '5',
    eventType: '6',
    shopType: '7',
    idOrganization: '1',
    idDestination: '1'
});

