import React, { useState } from 'react';

// Import all images
import spinach from '../assets/produce/spinach.jpg';
import carrots from '../assets/produce/carrots.jpg';
import beets from '../assets/produce/beets.jpg';
import cabbage from '../assets/produce/cabbage.jpg';
import potatoes from '../assets/produce/potatoes.jpg';
import broccoli from '../assets/produce/broccoli.jpg';
import cauliflower from '../assets/produce/cauliflower.jpg';
import leeks from '../assets/produce/leeks.jpg';
import radishes from '../assets/produce/radishes.jpg';
import turnips from '../assets/produce/turnips.jpg';
import asparagus from '../assets/produce/asparagus.jpg';
import peas from '../assets/produce/peas.jpg';
import lettuce from '../assets/produce/lettuce.jpg';
import springOnions from '../assets/produce/spring-onions.jpg';
import strawberries from '../assets/produce/strawberries.jpg';
import rhubarb from '../assets/produce/rhubarb.jpg';
import artichokes from '../assets/produce/artichokes.jpg';
import cherries from '../assets/produce/cherries.jpg';
import apricots from '../assets/produce/apricots.jpg';
import zucchini from '../assets/produce/zucchini.jpg';
import cucumbers from '../assets/produce/cucumbers.jpg';
import tomatoes from '../assets/produce/tomatoes.jpg';
import blueberries from '../assets/produce/blueberries.jpg';
import peaches from '../assets/produce/peaches.jpg';
import corn from '../assets/produce/corn.jpg';
import bellPeppers from '../assets/produce/bell-peppers.jpg';
import greenBeans from '../assets/produce/green-beans.jpg';
import watermelon from '../assets/produce/watermelon.jpg';
import cantaloupe from '../assets/produce/cantaloupe.jpg';
import eggplant from '../assets/produce/eggplant.jpg';
import okra from '../assets/produce/okra.jpg';
import grapes from '../assets/produce/grapes.jpg';
import figs from '../assets/produce/figs.jpg';
import pumpkins from '../assets/produce/pumpkins.jpg';
import squash from '../assets/produce/squash.jpg';
import apples from '../assets/produce/apples.jpg';
import pears from '../assets/produce/pears.jpg';
import plums from '../assets/produce/plums.jpg';
import sweetPotatoes from '../assets/produce/sweet-potatoes.jpg';
import brusselsSprouts from '../assets/produce/brussels-sprouts.jpg';
import persimmons from '../assets/produce/persimmons.jpg';
import cranberries from '../assets/produce/cranberries.jpg';
import winterSquash from '../assets/produce/winter-squash.jpg';
import kale from '../assets/produce/kale.jpg';
import pomegranates from '../assets/produce/pomegranates.jpg';
import citrus from '../assets/produce/citrus.jpg';
import winterGreens from '../assets/produce/winter-greens.jpg';
import rootVegetables from '../assets/produce/root-vegetables.jpg';
import placeholder from '../assets/produce/placeholder.jpg';

const SeasonalCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const seasonalProduce = {
    0: [ // January
      { name: 'Spinach', image: spinach },
      { name: 'Carrots', image: carrots },
      { name: 'Beets', image: beets },
      { name: 'Cabbage', image: cabbage },
      { name: 'Potatoes', image: potatoes }
    ],
    1: [ // February
      { name: 'Broccoli', image: broccoli },
      { name: 'Cauliflower', image: cauliflower },
      { name: 'Leeks', image: leeks },
      { name: 'Radishes', image: radishes },
      { name: 'Turnips', image: turnips }
    ],
    2: [ // March
      { name: 'Asparagus', image: asparagus },
      { name: 'Peas', image: peas },
      { name: 'Lettuce', image: lettuce },
      { name: 'Radishes', image: radishes },
      { name: 'Spring Onions', image: springOnions }
    ],
    3: [ // April
      { name: 'Strawberries', image: strawberries },
      { name: 'Rhubarb', image: rhubarb },
      { name: 'Artichokes', image: artichokes },
      { name: 'Peas', image: peas },
      { name: 'Lettuce', image: lettuce }
    ],
    4: [ // May
      { name: 'Cherries', image: cherries },
      { name: 'Apricots', image: apricots },
      { name: 'Zucchini', image: zucchini },
      { name: 'Cucumbers', image: cucumbers },
      { name: 'Tomatoes', image: tomatoes }
    ],
    5: [ // June
      { name: 'Blueberries', image: blueberries },
      { name: 'Peaches', image: peaches },
      { name: 'Corn', image: corn },
      { name: 'Bell Peppers', image: bellPeppers },
      { name: 'Green Beans', image: greenBeans }
    ],
    6: [ // July
      { name: 'Watermelon', image: watermelon },
      { name: 'Cantaloupe', image: cantaloupe },
      { name: 'Eggplant', image: eggplant },
      { name: 'Okra', image: okra },
      { name: 'Tomatoes', image: tomatoes }
    ],
    7: [ // August
      { name: 'Grapes', image: grapes },
      { name: 'Figs', image: figs },
      { name: 'Pumpkins', image: pumpkins },
      { name: 'Squash', image: squash },
      { name: 'Apples', image: apples }
    ],
    8: [ // September
      { name: 'Pears', image: pears },
      { name: 'Plums', image: plums },
      { name: 'Sweet Potatoes', image: sweetPotatoes },
      { name: 'Brussels Sprouts', image: brusselsSprouts },
      { name: 'Cauliflower', image: cauliflower }
    ],
    9: [ // October
      { name: 'Persimmons', image: persimmons },
      { name: 'Cranberries', image: cranberries },
      { name: 'Pumpkins', image: pumpkins },
      { name: 'Winter Squash', image: winterSquash },
      { name: 'Kale', image: kale }
    ],
    10: [ // November
      { name: 'Pomegranates', image: pomegranates },
      { name: 'Citrus', image: citrus },
      { name: 'Carrots', image: carrots },
      { name: 'Beets', image: beets },
      { name: 'Cabbage', image: cabbage }
    ],
    11: [ // December
      { name: 'Winter Greens', image: winterGreens },
      { name: 'Root Vegetables', image: rootVegetables },
      { name: 'Cabbage', image: cabbage },
      { name: 'Leeks', image: leeks },
      { name: 'Potatoes', image: potatoes }
    ]
  };

  const getSeasonBadge = (month) => {
    if ([11, 0, 1].includes(month)) return { text: '❄️ Winter Harvest', color: 'bg-blue-100 text-blue-800' };
    if ([2, 3, 4].includes(month)) return { text: '🌱 Spring Harvest', color: 'bg-green-100 text-green-800' };
    if ([5, 6, 7].includes(month)) return { text: '☀️ Summer Harvest', color: 'bg-yellow-100 text-yellow-800' };
    return { text: '🍂 Autumn Harvest', color: 'bg-orange-100 text-orange-800' };
  };

  const currentSeason = getSeasonBadge(selectedMonth);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">🌾 Seasonal Harvest Calendar</h2>
      
      {/* Month Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Season Info */}
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${currentSeason.color}`}>
        {currentSeason.text}
      </div>

      {/* Seasonal Produce Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fresh This Month</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {seasonalProduce[selectedMonth].map((produce, index) => (
            <div
              key={index}
              className="bg-green-50 border border-green-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="h-32 bg-gray-200 overflow-hidden">
                <img 
                  src={produce.image} 
                  alt={produce.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = placeholder;
                  }}
                />
              </div>
              <div className="p-3 text-center">
                <span className="font-medium text-green-800 text-sm">{produce.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Tip */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Seasonal Eating Tip</h4>
        <p className="text-sm text-yellow-700">
          Eating seasonally means enjoying produce at its peak flavor and nutrition! Seasonal foods are often more affordable and support local farmers.
        </p>
      </div>
    </div>
  );
};

export default SeasonalCalendar;