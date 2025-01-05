import React from 'react';
import FeatureCard from './FeatureCard';
import { GlobeAltIcon, DocumentTextIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    {
      title: 'Decentralization',
      description: 'Developed based on a public chain that supports smart contracts, it naturally has all the characteristics of a blockchain, and the data is decentralized.',
      icon: GlobeAltIcon,
    },
    {
      title: 'Credit system',
      description: 'Build a blockchain-based credit system to improve data security, openness, and people’s trust in credit data.',
      icon: DocumentTextIcon,
    },
    {
      title: 'Community',
      description: 'Any individual or organization can participate in the governance of Xiqi as long as you have enough user trust.',
      icon: UserGroupIcon,
    },
    {
      title: 'Incentive system',
      description: 'The incentive system based on digital points is inherently open, fair and just.',
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="bg-[#FFF5F7] py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;