import React, { useEffect, useState } from 'react';
import { FIXED_COLORS } from './constants';
import { generatePlanets } from './utils';

const PlanetBackground = () => {
  const [planets, setPlanets] = useState([]);

  useEffect(() => {
    setPlanets(generatePlanets());

    const positionAndSizeInterval = setInterval(() => {
      setPlanets(prevPlanets =>
        prevPlanets.map(planet => ({
          ...planet,
          x: Math.random() * (window.innerWidth - 200),
          y: Math.random() * (window.innerHeight - 200),
          size: Math.random() * 140 + 35,
        }))
      );
    }, 4000);

    const colorInterval = setInterval(() => {
      setPlanets(prevPlanets =>
        prevPlanets.map(planet => ({
          ...planet,
          color: FIXED_COLORS[Math.floor(Math.random() * FIXED_COLORS.length)],
        }))
      );
    }, 10000);

    return () => {
      clearInterval(positionAndSizeInterval);
      clearInterval(colorInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {planets.map((planet) => (
        <div
          key={planet.id}
          className={`absolute rounded-full ${planet.opacity} ${planet.blur} ${planet.color}`}
          style={{
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            transform: `translate(${planet.x}px, ${planet.y}px)`,
            transition: "transform 4s ease-in-out, width 4s ease-in-out, height 4s ease-in-out, background-color 2s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default PlanetBackground;