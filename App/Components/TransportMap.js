import { Alert, Animated, AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import BackHeader from './BackHeader';
import MapView, { AnimatedRegion, Callout, Circle, Marker, MarkerAnimated, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import NavigationService from '../Services/Navigation';
import Geolocation from '@react-native-community/geolocation';
import database from '@react-native-firebase/database';
import { Images } from '../Constants/Images';
import MapViewDirections from 'react-native-maps-directions';
import { useSelector } from 'react-redux';
import { TextStyles, appStyles } from '../Constants/Fonts';
import { moderateScale, screenHeight } from '../Constants/PixelRatio';
import { Colors } from '../Constants/Colors';
import UseApi from '../ApiConfig';

const darkStyles = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#212121"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#181818"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1b1b1b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#2c2c2c"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8a8a8a"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#373737"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3c3c3c"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#4e4e4e"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3d3d3d"
            }
        ]
    }
]

const customStyles = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f5f5"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f5f5"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#bdbdbd"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#757575"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dadada"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#616161"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e5e5e5"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c9c9c9"
                //   "color": "blue"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9e9e9e"
                // "color": "blue"
            }
        ]
    }
]

const customMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c1d5b3"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#b0d9f1"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ];
  

// const customStyles = [
//     {
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#ebe3cd"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#523735"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#f5f1e6"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#c9b2a6"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.land_parcel",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#dcd2be"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.land_parcel",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#ae9e90"
//         }
//       ]
//     },
//     {
//       "featureType": "landscape.natural",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#93817c"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#a5b076"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#447530"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#f5f1e6"
//         }
//       ]
//     },
//     {
//       "featureType": "road.arterial",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#fdfcf8"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#f8c967"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#e9bc62"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway.controlled_access",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#e98d58"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway.controlled_access",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#db8555"
//         }
//       ]
//     },
//     {
//       "featureType": "road.local",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#806b63"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#8f7d77"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#ebe3cd"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.station",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#b9d3c2"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#92998d"
//         }
//       ]
//     }
//   ]

// const customStyles = [
//     {
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#1d2c4d"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#8ec3b9"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#1a3646"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.country",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#4b6878"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.land_parcel",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#64779e"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.province",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#4b6878"
//         }
//       ]
//     },
//     {
//       "featureType": "landscape.man_made",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#334e87"
//         }
//       ]
//     },
//     {
//       "featureType": "landscape.natural",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#023e58"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#283d6a"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#6f9ba5"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#1d2c4d"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#023e58"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#3C7680"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#304a7d"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#98a5be"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#1d2c4d"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#2c6675"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#255763"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#b0d5ce"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#023e58"
//         }
//       ]
//     },
//     {
//       "featureType": "transit",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#98a5be"
//         }
//       ]
//     },
//     {
//       "featureType": "transit",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#1d2c4d"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#283d6a"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.station",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#3a4762"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#0e1626"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#4e6d70"
//         }
//       ]
//     }
//   ]

// const customStyles = [
//     {
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#eaeaea"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#523735"
//         }
//       ]
//     },
//     {
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#f5f1e6"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#c9b2a6"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.land_parcel",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#dcd2be"
//         }
//       ]
//     },
//     {
//       "featureType": "administrative.land_parcel",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#ae9e90"
//         }
//       ]
//     },
//     {
//       "featureType": "landscape.man_made",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#334e87"
//         }
//       ]
//     },
//     {
//       "featureType": "landscape.natural",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dcd2be"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "poi",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#93817c"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#a5b076"
//         }
//       ]
//     },
//     {
//       "featureType": "poi.park",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#447530"
//         }
//       ]
//     },
//     {
//       "featureType": "road",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#ffffff"
//         }
//       ]
//     },
//     {
//       "featureType": "road.arterial",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#fdfcf8"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#f8c967"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#e9bc62"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway.controlled_access",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#e98d58"
//         }
//       ]
//     },
//     {
//       "featureType": "road.highway.controlled_access",
//       "elementType": "geometry.stroke",
//       "stylers": [
//         {
//           "color": "#db8555"
//         }
//       ]
//     },
//     {
//       "featureType": "road.local",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#806b63"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#8f7d77"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.line",
//       "elementType": "labels.text.stroke",
//       "stylers": [
//         {
//           "color": "#ebe3cd"
//         }
//       ]
//     },
//     {
//       "featureType": "transit.station",
//       "elementType": "geometry",
//       "stylers": [
//         {
//           "color": "#dfd2ae"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "geometry.fill",
//       "stylers": [
//         {
//           "color": "#b9d3c2"
//         }
//       ]
//     },
//     {
//       "featureType": "water",
//       "elementType": "labels.text.fill",
//       "stylers": [
//         {
//           "color": "#92998d"
//         }
//       ]
//     }
//   ]




// const stopages = [
//     { latitude: 21.998925493369338, longitude: 87.67359372228384, name: 'location1' },
//     { latitude: 21.99879337569683, longitude: 87.67399102449417, name: 'location2' },
//     { latitude: 21.998481266635775, longitude: 87.67443090677261, name: 'location3' },
//     { latitude: 21.997576954731183, longitude: 87.67528988420963, name: 'location4' },
//     { latitude: 21.996221564111256, longitude: 87.67763379961252, name: 'location5' }
// ]
const stopagesData = [
    { name: 'Brooklyn East', distance: '10 km', pickupTime: '6:00 PM' },
    { name: 'Brooklyn North', distance: '10 km', pickupTime: '6:20 PM' },
    { name: 'Brooklyn South', distance: '20 km', pickupTime: '6:40 PM' },
    { name: 'Brooklyn Central', distance: '40 km', pickupTime: '7:10 PM' },
    { name: 'Manhattan', distance: '10 km', pickupTime: '7:30 PM' },
    { name: 'Railway Station', distance: '30 km', pickupTime: '8:10 PM' },
];
const stopages = [
    { "latitude": 21.999127555453928, "longitude": 87.67333086580038, name: 'Itaberiya', latitudeDelta: 0.1, longitudeDelta: 0.1, id: '5' },
    { "latitude": 21.99883099038788, "longitude": 87.67377376556396, name: 'Itaberiya', latitudeDelta: 0.1, longitudeDelta: 0.1, id: '4' },
    { "latitude": 21.998448314842232, "longitude": 87.6743869856, name: 'Itaberiya3', id: '2' },
    { "latitude": 21.99781352502318, "longitude": 87.67495661973953, name: 'Itaberiya4', id: '1' },
    { "latitude": 21.996824963232225, "longitude": 87.67631080001593, name: 'Itaberiya4', id: '7' },
    { "latitude": 21.996221564111256, "longitude": 87.67763379961252, name: 'Itaberiya5', id: '6' }
]
// const waypoints = [
//     { "latitude": 21.998925493369338, "longitude": 87.67359372228384, name: 'Itaberiya' },
//     { "latitude": 21.99879337569683, "longitude": 87.67399102449417, name: 'Itaberiya2' },
//     { "latitude": 21.998481266635775, "longitude": 87.67443090677261, name: 'Itaberiya3' },
//     { "latitude": 21.997576954731183, "longitude": 87.67528988420963, name: 'Itaberiya4' },
//     { "latitude": 21.996221564111256, "longitude": 87.67763379961252, name: 'Itaberiya5' }
// ]
// const stopages = [
//     { "latitude": 21.99994232903097, "longitude": 87.6732487231493, name: 'Itaberiya' },
//     { "latitude": 22.00914729763332, "longitude": 87.70263064652681, name: 'Udbadal' },
//     { "latitude": 22.008503852081734, "longitude": 87.71384295076132, name: 'Mugberiya' },
//     { "latitude": 22.001232403525883, "longitude": 87.72988323122263, name: 'Bhupatinagar' },
//     { "latitude": 21.99674755668791, "longitude": 87.73886293172836, name: 'Madhakhali' },
//     { "latitude": 21.986435632604394, "longitude": 87.77078859508038, name: 'Jukhiya' },
//     { "latitude": 21.968371949440385, "longitude": 87.80362587422132, name: 'Henriya' },
// ]



// const updateUserAgePeriodically = (initialAge, interval) => {
//     const userRef = database().ref('/users/123/test');
//     let userAge = initialAge;

//     const intervalId = setInterval(() => {
//         userRef.update({
//             age: userAge,
//         })
//             .then(() => {
//                 // console.log('Data updated user age...', userAge);
//                 userAge += 1;
//             })
//             .catch(error => {
//                 console.error('Error updating data:', error);
//             });
//     }, interval);

//     return () => clearInterval(intervalId);  // Cleanup on unmount
// };

const TransportMap = ({ route }) => {
    // const { stopages } = route?.params || {};
    const [appState, setAppState] = useState(AppState.currentState);
    const { userData, vehicleDetails } = useSelector(state => state.User);
    const [currLoc, setCurrLoc] = useState({
        latitude: 21.99910228,
        longitude: 87.67292397,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
        // name: 'location1',
        // pickupTime: '10 AM'
    });
    // const [startPoint, setStartPoint] = useState({ latitude: 21.99910422, longitude: 87.67290725 });
    // const [endpoint, setEndPoint] = useState({ latitude: 21.99910422, longitude: 87.67290725 });
    const [startPoint, setStartPoint] = useState(null);
    const [prevLength, setPrevLength] = useState(null);
    const { Request } = UseApi();
    // const [isJourneyStarted, setIsJourneyStarted] = useState(false);
    const [targetIndex, setTargetIndex] = useState(0);
    const [carRotation, setCarRotation] = useState(0);
    // const [prevMarkerPosition, setPrevMarkerPostition] = useState(null);
    // const [endpoint, setEndPoint] = useState(null);
    // const [destination, setDestination] = useState({ latitude: 21.99910228, longitude: 87.67292397 });
    // const [currAction, setCurrAction] = useState(null);
    const [showStopageList, setShowStopageList] = useState(true);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [distances, setDistances] = useState({});
    const [betweenStopageTimes, setBetweenStopageTimes] = useState({});
    const [reachTimes, SetReachTimes] = useState({});
    const [betweenStopageLength, setBetweenStopageLength] = useState({});
    const [fixedLength, setFixedLength] = useState({});
    const [stopageHeight, setStopageHeight] = useState(null);
    const [currStopagHeight, setCurrStopageHeight] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    // const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const [slideAnim] = useState(new Animated.Value(0));
    const [markerPosition] = useState(
        new AnimatedRegion(stopages[0])
        // new AnimatedRegion({
        //     latitude: 21.99910228,
        //     longitude: 87.67292397,
        //     latitudeDelta: 0.1,
        //     longitudeDelta: 0.1,
        // })
    );

    // const markerPosition = useRef(new AnimatedRegion({
    //     latitude:  21.99910228,
    //     longitude: 87.67292397,
    //     latitudeDelta: 0.1,
    //     longitudeDelta: 0.1,
    // })).current;

    // useEffect(() => {
    //     animateToDestination();
    //     updateLocation(destination);
    // }, [destination]);

    // useEffect(() => {
    //     const stopUpdating = updateUserAgePeriodically(25, 1000); // Start from age 25, update every 1 second

    //     return () => {
    //         stopUpdating(); // Cleanup on unmount
    //     };
    // }, []);

    useEffect(() => {
        if (routeCoordinates.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(routeCoordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [routeCoordinates]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App has come to the foreground!');
                // onForeground();
            } else if (nextAppState === 'background') {
                console.log('App has gone to the background!');
                // setInterval(() => {
                //      console.log('backgound.....')
                // }, 1000);
                // onBackground();
            }
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [appState]);

    useEffect(() => {
        console.log('stopages....', stopages);
        Animated.timing(slideAnim, {
            toValue: showStopageList ? screenHeight / 3 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [showStopageList]);

    useEffect(() => {
        const userRef = database().ref('/users/123/location');
        const onValueChange = userRef.on('value', snapshot => {
            console.log('User data: ', snapshot.val());
            let { latitude, longitude, movingAngle } = snapshot.val();
            // if (markerPosition) {
            //     let positionstr = JSON.stringify(markerPosition);
            //     let position = JSON.parse(positionstr);
            //     let shortDistance = calculateDistance(position, { latitude: latitude, longitude: longitude });
            //     if (shortDistance > 0.003) {
            //         let angle = getBearing(position, { latitude: latitude, longitude: longitude });
            //         console.log('angle..', angle);
            //         setCarRotation(angle);
            //     }
            // }
            if (movingAngle) {
                setCarRotation(movingAngle);
            }
            markerPosition.timing({ latitude: latitude, longitude: longitude }).start();
            // console.log('markerposition...',markerPosition);
            console.log('taretINdex..', targetIndex);
            if (targetIndex > stopages?.length) {
                userRef.off('value', onValueChange);
                return;
            }
            // if (targetIndex > 0) {
            //     setStartPoint({ latitude: latitude, longitude: longitude });
            // }
            setStartPoint({ latitude: latitude, longitude: longitude });

            let distance = calculateDistance({ latitude: latitude, longitude: longitude }, stopages[targetIndex]);
            // console.log('distance...', distance);
            if (distance < 0.010) {
                if (targetIndex == (stopages.length - 1)) {
                    setTargetIndex(targetIndex + 2);
                } else {
                    setTargetIndex(targetIndex + 1);
                    updateHistory(stopages[targetIndex]);
                }
            }
        });

        // Clean up the listener on component unmount
        return () => {
            userRef.off('value', onValueChange);
        };
    }, [targetIndex]);

    useEffect(() => {
        setStartPoint(stopages[0]);
        // setStartPoint(waypoints[0]);
        getCurrLocation();
    }, []);

    useEffect(() => {
        // if (currAction == 'startJourney') {
        let watchId = Geolocation.watchPosition(position => {
            console.log('position...', position);
            let { latitude, longitude } = position.coords;
            // if (currLoc) {
            const newRegion = {
                latitude,
                longitude,
                // latitudeDelta: currLoc?.latitudeDelta,
                // longitudeDelta: currLoc?.longitudeDelta,
                movingAngle: position.coords?.heading
            };
            console.log('new region...', newRegion);
            if (targetIndex > stopages?.length) {
                Geolocation.clearWatch(watchId);
                return;
            } else if (targetIndex == stopages?.length) {
                setTargetIndex(0);
            }
            setCurrLoc({
                ...newRegion,
                latitudeDelta: currLoc?.latitudeDelta,
                longitudeDelta: currLoc?.longitudeDelta,
            });
            if (userData.type == 'driver') {
                updateLocation(newRegion);
                // markerPosition.timing({ latitude, longitude }).start();
                // setStartPoint({ latitude: latitude, longitude: longitude });
            }
            // if (mapRef.current) {
            //     mapRef.current.animateToRegion(newRegion, 1000);
            // }
            // }
        },
            (error) => console.log('error wathpos...', error),
            { enableHighAccuracy: true, distanceFilter: 0.01 }
        )
        // const watchHeadingId = Geolocation.watchHeading((headingData) => {
        //     // setHeading(headingData.trueHeading);
        //     console.log('headingData.trueHeading..',headingData.trueHeading);
        //   });

        return () => {
            Geolocation.clearWatch(watchId)
            // Geolocation.clearWatch(watchHeadingId);
        };
        // }
    }, [targetIndex]);

    useEffect(() => {
        measureEstimatedTime();
    }, [betweenStopageTimes]);

    useEffect(() => {
        let distance = betweenStopageLength[targetIndex];
        if (fixedLength[targetIndex]) {
            let h = stopageHeight - ((distance * stopageHeight) / (fixedLength[targetIndex]))
            // console.log('h...', h);
            setCurrStopageHeight(h);
        }
    }, [betweenStopageLength]);


    const updateLocation = (location) => {
        database()
            .ref('/users/123/location')
            .update({
                ...location
            })
            .then(() => {
                // console.log('Data updated user location...', location);
            });
    }

    const getCurrLocation = () => {
        Geolocation.getCurrentPosition(position => {
            let { latitude, longitude } = position?.coords;
            // setCurrLoc(position.coords);
            let loc = {
                latitude,
                longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            }
            setCurrLoc(loc);
            // if (userData.type == 'driver') {
            //     updateLocation(loc);
            // }
            console.log('position...', position?.coords);
            // markerPosition.timing({ latitude, longitude }).start();
        },
            error => { console.log('error msg...', error.message) },
            // { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
        );
    }
    const calculateDistance = (location1, mainLocation) => {
        // let mainLoc = mainLocation ? mainLocation : center;
        let lat1 = location1.latitude;
        let lon1 = location1.longitude;
        let lat2 = mainLocation.latitude;
        let lon2 = mainLocation.longitude;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
        const dLon = (lon2 - lon1) * (Math.PI / 180); // Convert degrees to radians
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        // console.log('distance in func');
        return distance.toFixed(3);
    };

    // const getBearing = (location1, mainLocation) => {
    //     const startLatRad = toRadians(location1.latitude);
    //     const startLngRad = toRadians(location1.longitude);
    //     const endLatRad = toRadians(mainLocation.latitude);
    //     const endLngRad = toRadians(mainLocation.longitude);

    //     const dLng = endLngRad - startLngRad;
    //     const y = Math.sin(dLng) * Math.cos(endLatRad);
    //     const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
    //         Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
    //     const bearingRad = Math.atan2(y, x);

    //     return (toDegrees(bearingRad) + 360) % 360;
    // };

    // const toRadians = (degrees) => {
    //     return degrees * (Math.PI / 180);
    // };

    // const toDegrees = (radians) => {
    //     return radians * (180 / Math.PI);
    // };

    const updateHistory = async (stopage) => {
        // setLoading(true);
        let params = {
            driver_id: userData?.type == 'driver' ? userData?.id : userData?.driver_id,
            location: stopage.id,
            status: stopage.id == stopages[stopages.length - 1].id,
            vehicle_id: vehicleDetails.number,
            arrive_time: Date.now()
        }

        let data;
        try {
            data = await Request('trans-history', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
  
        if (data?.status) {
            Alert.alert('', data.message);
        } else {
            Alert.alert('', data.message);
        }
        // setLoading(false);
    }

    // const animateToDestination = () => {
    //     if (mapRef.current && currLoc && destination) {
    //         // mapRef.current.animateToRegion({
    //         //     ...destination,
    //         //     latitudeDelta: currLoc?.latitudeDelta,
    //         //     longitudeDelta: currLoc?.longitudeDelta,
    //         // }, 100);
    //         markerPosition.timing({
    //             ...destination,
    //             duration: 100,
    //         }).start();
    //     }
    // };

    // const moveMarker = () => {
    //     setInterval(() => {
    //         setDestination(pre => ({ latitude: pre.latitude + 0.0001, longitude: pre.longitude + 0.0001 }));
    //     }, 100);
    // }


    // const takeRoute = () => {
    //     if (stopages?.length > 1) {
    //         setStartPoint(stopages[0]);
    //         console.log('stpslks', startPoint);
    //         // setEndPoint(stopages[stopages?.length - 1]);
    //     }

    //     // if (!startPoint) {
    //     //     Alert.alert('', 'Please press on the map to select a pick up point', [
    //     //         { text: 'Cancel', onPress: () => console.log('cancelled'), style: 'No' },
    //     //         { text: 'Ok', onPress: () => setCurrAction('startPoint') }
    //     //     ]);
    //     // } else if (!endpoint) {
    //     //     Alert.alert('', 'Please press on the map to select your destination', [
    //     //         { text: 'Cancel', onPress: () => console.log('cancelled'), style: 'No' },
    //     //         { text: 'Ok', onPress: () => setCurrAction('endPoint') }
    //     //     ]);
    //     // }
    // }

    const measureEstimatedTime = () => {
        let estTime = {}
        let time = 0;
        stopages.forEach((iten, ind) => {
            if ((ind + 1) < targetIndex) {
                estTime[ind + 1] = null
            } else if (ind < (stopages.length - 1)) {
                time = time + betweenStopageTimes[ind + 1];
                estTime[ind + 1] = time;
            }
        });
        SetReachTimes(estTime);
        // console.log('estTime...',estTime);
    }
    // const measureLength = (currind,currStopLength)=>{
    //       let lengths = {}
    //        stopages.forEach((iten,ind)=>{

    //        });
    // }



    return (
        <View style={{ flex: 1 }}>
            {/* <Text>TransportMap</Text> */}
            <BackHeader
                title='Map'
                onBackIconPress={() => {
                    NavigationService.navigate('TransportRoutes');
                }}
            />
            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    onPress={event => {
                        let { coordinate } = event.nativeEvent;
                        console.log('event.nativeEvent...', event.nativeEvent);
                        console.log('coordinate...', coordinate);
                        // if (currAction == 'startPoint') {
                        //     setStartPoint({ latitude: coordinate.latitude, longitude: coordinate.longitude });
                        // } else if (currAction == 'endPoint') {
                        //     setEndPoint({ latitude: coordinate.latitude, longitude: coordinate.longitude });
                        // }
                    }}
                    provider={PROVIDER_GOOGLE}
                    // customMapStyle={customStyles}
                    customMapStyle={customMapStyle}
                    // userInterfaceStyle='dark'
                    // region={{
                    //     latitude: currLoc.latitude,
                    //     longitude: currLoc.longitude,
                    //     latitudeDelta: 0.1,
                    //     longitudeDelta: 0.1
                    // }}
                    // initialRegion={stopages[0]}
                    initialRegion={{
                        ...stopages[0],
                        latitudeDelta: Math.abs(stopages[0].latitude - stopages[0].latitude) + 0.1,
                        longitudeDelta: Math.abs(stopages[0].longitude - stopages[0].longitude) + 0.1
                    }}
                    // zoomEnabled={true}
                    zoomControlEnabled
                    // onRegionChange={(region)=>setCurrLoc(region)}
                    // region={currLoc}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >
                    {userData.type == 'student' && <Marker
                        coordinate={currLoc}
                        title='User'
                        description='I am here'
                    />}
                    {/* <Marker.Animated ref={markerRef} coordinate={markerPosition} image={Images.car} style={{width:15,height:15}} /> */}
                    {/* <Marker.Animated ref={markerRef} coordinate={markerPosition} /> */}

                    <Marker.Animated ref={markerRef} coordinate={markerPosition}
                        // rotation={carRotation ? (carRotation + 90) : 0}
                        rotation={carRotation + 90}
                    >
                        <View style={{ height: 35, width: 35, justifyContent: 'center', alignItems: 'center' }}>
                            <Animated.Image source={Images.car2} style={{ height: '100%', width: '100%', marginTop: 5 }} resizeMode={'contain'} />
                        </View>
                    </Marker.Animated>

                    {/* <MarkerAnimated ref={markerRef} coordinate={markerPosition}/> */}

                    {targetIndex == 0 && <MapViewDirections
                        origin={startPoint}
                        destination={stopages[0]}
                        apikey={'AIzaSyDPTHOYE5ZFGDIYxVsiJmOwMn9sHx0iYQA'}
                        strokeWidth={3}
                        // strokeColor="blue"
                        strokeColor="black"
                    // onReady={result => {
                    //     console.log('result.distance..', result.distance);
                    //     if (prevLength && (result.distance - prevLength) > 0.005) {
                    //         setPrevLength(null);
                    //         setTargetIndex(targetIndex + 1);
                    //     } else {
                    //         setPrevLength(result.distance);
                    //     }
                    //     setDistances(pre => ({ ...pre, [index + 1]: result.distance + (pre[index] || 0) }));
                    //     setBetweenStopageLength(pre => ({ ...pre, [index + 1]: result.distance }));
                    //     if (targetIndex == 0) {
                    //         setFixedLength(pre => ({ ...pre, [index + 1]: result.distance }));
                    //     }
                    //     setBetweenStopageTimes(pre => ({ ...pre, [index + 1]: result.duration }));
                    // }}
                    />}
                    {stopages.map((item, index) => {
                        return (
                            <>
                                {startPoint && index < (stopages.length - 1) &&
                                    <>
                                        {index == 0 && <Marker
                                            key={index}
                                            coordinate={item}
                                            title={item?.name}
                                            // description={item?.name}
                                            // description={`${0} KM , ${stopages[index]?.pickupTime}`}
                                            description={`${0} KM , ${0} Min`}
                                        // image={Images.source}
                                        // style={{ height: 20, width: 20 }}

                                        >
                                            <View style={{ height: 25, width: 25 }}>
                                                <Image source={Image.resolveAssetSource(Images.source)} style={{ height: 25, width: 25 }} resizeMode='contain' />
                                            </View>
                                        </Marker>}


                                        {index >= (targetIndex - 1) && <MapViewDirections
                                            origin={index < targetIndex ? startPoint : stopages[index]}
                                            destination={stopages[index + 1]}
                                            apikey={'AIzaSyDPTHOYE5ZFGDIYxVsiJmOwMn9sHx0iYQA'}
                                            strokeWidth={3}
                                            // strokeColor="blue"
                                            strokeColor="black"
                                            onReady={result => {
                                                console.log('result.distance..', result.distance);
                                                setRouteCoordinates((prevCoords) => [...prevCoords, ...result.coordinates]);
                                                if (prevLength && (result.distance - prevLength) > 0.005) {
                                                    setPrevLength(null);
                                                    setTargetIndex(targetIndex + 1);
                                                } else {
                                                    setPrevLength(result.distance);
                                                }
                                                setDistances(pre => ({ ...pre, [index + 1]: result.distance + (pre[index] || 0) }));
                                                setBetweenStopageLength(pre => ({ ...pre, [index + 1]: result.distance }));
                                                if (targetIndex == 0) {
                                                    setFixedLength(pre => ({ ...pre, [index + 1]: result.distance }));
                                                }
                                                // setDistances(pre => ({ ...pre, [index + 1]: result.distance}));
                                                // setEstimatedTime(pre => ({ ...pre, [index + 1]: result.duration + (pre[index] || 0) }));
                                                // setEstimatedTime(pre => ({ ...pre, [index + 1]: result.duration}));
                                                setBetweenStopageTimes(pre => ({ ...pre, [index + 1]: result.duration }));
                                                // if (index < targetIndex) {
                                                //     measureEstimatedTime();
                                                // }
                                                // console.log('result.duration..', result.duration);
                                            }}
                                        />}
                                        <Marker
                                            coordinate={stopages[index + 1]}
                                            title={stopages[index + 1]?.name}
                                            // description={`${stopages[index + 1]?.distance} KM, ${stopages[index + 1]?.pickupTime}`}
                                            description={`${distances[index + 1] || 'NA'} KM , ${reachTimes[index + 1]?.toFixed(1)} Min`}
                                            // image={(index == (stopages.length - 2)) ? Images.destination : Images.stopage}
                                            // icon={(index == (stopages.length - 2)) ? Images.destination : Images.stopage}
                                            style={{ height: 25, width: 25 }}
                                        >
                                            <View style={{ height: 25, width: 25 }}>
                                                <Image source={Image.resolveAssetSource((index == (stopages.length - 2)) ? Images.destination : Images.stopage)} style={{ height: 25, width: 25 }} resizeMode='contain' />
                                                {/* <Image source={(index == (stopages.length - 2)) ? Images.destination : Images.stopage} style={{ height: 25, width: 25 }} resizeMode='contain' /> */}
                                            </View>
                                        </Marker>
                                    </>
                                }
                            </>
                        )
                    })}


                    {/* <Polyline
                        coordinates={waypoints}
                        strokeColor="#FF0000" // Line color
                        strokeWidth={2} // Line width
                    /> */}

                    {/* <MapViewDirections
                        origin={waypoints[currind]}
                        // origin={startPoint}
                        destination={waypoints[waypoints.length - 1]}
                        apikey={'AIzaSyDPTHOYE5ZFGDIYxVsiJmOwMn9sHx0iYQA'}
                        strokeWidth={3}
                        waypoints={waypoints}
                        optimizeWaypoints = {true}
                        // strokeColor="blue"
                        strokeColor="black"
                        onReady={result => {
                            console.log('result.distance..', result.distance);
                            // setDistances(pre => ({ ...pre, [index + 1]: result.distance + (pre[index] || 0) }))
                            // // setDistances(pre => ({ ...pre, [index + 1]: result.distance}));
                            // setEstimatedTime(pre => ({ ...pre, [index + 1]: result.duration + (pre[index] || 0) }));
                            // // console.log('result.duration..', result.duration);
                        }}
                    />
                    {waypoints.map((item, index) => {
                        return (
                            <Marker
                                coordinate={item}
                                title={'title'}
                                description={'description'}
                                // icon={Images.stopage}
                                // pinColor='blue'
                                image={Images.stopage}
                            // style={{height:20,width:20}}
                            >
                            </Marker>
                        )
                    })} */}


                    {/* {startPoint && <Circle
                    center={startPoint}
                    radius={50} // radius in meters
                    strokeWidth={2}
                    // strokeColor="rgba(0,122,255,0.5)"
                    strokeColor="black"
                    fillColor="black"
                    // fillColor="rgba(0,0,0,0.5)"
                />} */}
                </MapView>
            </View>

            {/* <View style={{ width: '50%', marginBottom: 10 }}>
                <Text style={styles.button} onPress={() => {
                    // setTargetIndex(2);
                    let currTime = new Date();
                    let time = Date.now();
                    console.log('currTime...',currTime);
                    console.log('currTime.getTime()...',currTime.getTime());
                    console.log('time...',time);
                }}>Test button</Text>
            </View> */}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 15, columnGap: 10, elevation: 10, backgroundColor: Colors.white2, paddingTop: 5 }}>
                <Pressable style={styles.showStopages}
                    onPress={() => setShowStopageList(!showStopageList)}
                >
                    <Image
                        source={Images.leftArrow}
                        style={{
                            height: moderateScale(12),
                            width: moderateScale(12),
                            marginTop: 3,
                            transform: [{ rotate: `${showStopageList ? 90 : 270}deg` }],
                            // resizeMode: 'stretch',
                            tintColor: Colors.white,
                        }}
                    />
                    <Text style={{ color: Colors.white }}>{showStopageList ? 'Show Stopages' : 'Hide Stopages'}</Text>
                </Pressable>
                {/* {<View style={{}}>
                    <Text style={styles.button}>Stopage Height:{currStopagHeight}</Text>
                </View>} */}
                <View style={{}}>
                    {targetIndex >= stopages?.length && userData.type == 'driver' && <View style={{}}>
                        <Text style={styles.button} onPress={() => setTargetIndex(0)}>Start Journey</Text>
                    </View>}
                    {targetIndex < stopages?.length && userData.type == 'driver' && <View style={{}}>
                        <Text style={styles.button} onPress={() => setTargetIndex(stopages.length + 1)}>Finish your Journey</Text>
                    </View>}
                </View>
            </View>

            <Animated.View style={{ height: showStopageList ? 0 : screenHeight / 2, transform: [{ translateY: slideAnim }], }}>
                <ScrollView style={{ marginTop: 20, paddingRight: 15 }}>
                    <View style={{ paddingBottom: 20 }}>
                        {stopages.map((item, index) => {
                            return (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <View style={{ ...styles.circle, backgroundColor: index == 0 ? Colors.green2 : (index == stopages.length - 1) ? Colors.red1 : Colors.lightBlck2 }}>
                                            <Image
                                                source={Images.address}
                                                style={{
                                                    height: moderateScale(8),
                                                    width: moderateScale(8),
                                                    resizeMode: 'stretch',
                                                    tintColor: (index == 0 || index == stopages.length - 1) ? Colors.white : Colors.black,
                                                }}
                                            />
                                        </View>
                                        {
                                            //    index != stopagesData.length - 1 && 
                                            <View
                                                style={styles.verticalLine}
                                                onLayout={e => {
                                                    if (index == 1) {
                                                        let height = e.nativeEvent.layout.height;
                                                        setStopageHeight(height);
                                                    }
                                                }}
                                            >
                                                {((currStopagHeight && index == targetIndex)) && <View
                                                    style={{
                                                        marginTop: currStopagHeight || 0,
                                                        height: 16,
                                                        width: 16,
                                                        backgroundColor: Colors.black,
                                                        borderRadius: 16,
                                                        marginLeft: -7
                                                    }}>
                                                </View>}
                                            </View>}
                                    </View>
                                    <View style={{ flex: 10, flexDirection: 'row', marginBottom: 15 }}>
                                        <View style={styles.horizontalLine} />
                                        <View style={styles.stopageCard}>
                                            <View style={appStyles.titleRow}>
                                                <Text style={TextStyles.title2}>{item.name}</Text>
                                            </View>
                                            <View style={{ padding: 15, paddingTop: 5 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                    <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                                        <Image
                                                            source={Images.distance}
                                                            style={{
                                                                height: moderateScale(12),
                                                                width: moderateScale(12),
                                                                resizeMode: 'stretch',
                                                            }}
                                                        />
                                                        <Text style={{ ...TextStyles.keyText, flex: null, marginTop: -2 }}>Distance</Text>
                                                    </View>
                                                    {/* <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{item.distance || 'NA'}</Text> */}
                                                    <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{distances[index] ? `${distances[index]?.toFixed(2)} km` : 'NA'}</Text>
                                                </View>
                                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                    <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                                        <Image
                                                            source={Images.clock}
                                                            style={{
                                                                height: moderateScale(12),
                                                                width: moderateScale(12),
                                                                resizeMode: 'stretch',
                                                            }}
                                                        />
                                                        <Text style={{ ...TextStyles.keyText, flex: null, marginTop: -2 }}>pickup Time</Text>
                                                    </View>
                                                    <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{item.pickupTime || 'NA'}</Text>
                                                </View> */}
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                    <View style={{ flexDirection: 'row', columnGap: 10 }}>
                                                        <Image
                                                            source={Images.clock}
                                                            style={{
                                                                height: moderateScale(12),
                                                                width: moderateScale(12),
                                                                resizeMode: 'stretch',
                                                            }}
                                                        />
                                                        <Text style={{ ...TextStyles.keyText, flex: null, marginTop: -2 }}>Time to reach</Text>
                                                    </View>
                                                    <Text style={{ ...TextStyles.valueText, marginTop: 0, flex: null }}>{reachTimes[index] ? `${reachTimes[index]?.toFixed(1)} min` : 'NA'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    )
}

export default TransportMap

const styles = StyleSheet.create({
    // buttonContainer: {
    //     position: 'absolute',
    //     bottom: 20,
    //     left: 20,
    // },
    button: {
        // backgroundColor: 'blue',
        backgroundColor: Colors.black,
        color: 'white',
        padding: 10,
        borderRadius: 5,
        // width:'100%'
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 5
    },
    circle: {
        borderRadius: moderateScale(20),
        backgroundColor: Colors.greyText,
        padding: moderateScale(3),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.3
        // opacity:0.8
    },
    verticalLine: {
        width: 2.5,
        height: 108,
        backgroundColor: Colors.greyText,
        opacity: 0.7
    },
    horizontalLine: {
        height: 2.5,
        width: moderateScale(30),
        marginTop: 10,
        backgroundColor: Colors.greyText,
        flex: 1,
        opacity: 0.7
    },
    stopageCard: {
        // padding: 10,
        borderRadius: 15,
        backgroundColor: Colors.white2,
        elevation: 10,
        flex: 8,
    },
    showStopages: {
        marginLeft: 10,
        flexDirection: 'row',
        // justifyContent:'center',
        columnGap: 5,
        backgroundColor: Colors.black,
        // width: '100%',
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 5,
        marginBottom: 10,
        // flex:1,

    }
})