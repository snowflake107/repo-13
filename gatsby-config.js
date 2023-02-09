/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

module.exports = {
  pathPrefix: process.env.PATH_PREFIX || '/aemcs-sandbox/',
  siteMetadata: {
    pages: [
      {
        title: 'Adobe Experience Manager API',
        path: '/'
      },
      {
        title: 'API Reference',
        menu: [
          {
            title: 'Sites',
            path: '/api/production/sites/index.md'
          },
          {
            title: 'Sites - Experimental',
            path: '/api/experimental/sites/index.md'
          },
          {
            title: 'Stats - Experimental',
            path: '/api/experimental/stats/index.md'
          }
        ]
      },
      {
        title: 'Support',
        path: '/support/'
      }
    ],
    subPages: [
      {
        title: 'Community',
        path: '/support/community/',
        header: true,
        pages: [
          {
            title: 'Information',
            path: '/support/community/'
          }
        ]
      }
    ]
  },
  plugins: [`@adobe/gatsby-theme-aio`]
};
