import { Avatar } from '@nextui-org/avatar';
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: 'Md Rijwan Jannat',
    role: 'Founder',
    imageUrl: 'https://i.ibb.co.com/fVg8DVg/sketch1699926435270.png',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
    },
  },
  {
    name: 'Abu Talha',
    role: 'Co-Founder',
    imageUrl: 'https://i.ibb.co/kmqWZ9x/IMG-0044.jpg',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
    },
  },
  {
    name: 'Debra Cavender',
    role: 'Web Developer',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
    },
  },
  {
    name: 'Vicky O. Harrell',
    role: 'UI Designer',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    socialLinks: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
    },
  },
];

const TeamSection: React.FC = () => {
  return (
    <section className="py-16 bg-default-50 text-center">
      <h3 className="text-sage-700 dark:text-sage-300 font-semibold uppercase mb-4 text-xs md:text-sm">
        Team Members
      </h3>
      <h2 className="text-xl md:text-2xl font-bold mb-8">Meet the Crew</h2>

      <div className="flex flex-wrap justify-center gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            className="max-w-xs bg-default-50 shadow-lg rounded-lg p-6 flex flex-col items-center space-y-4 transform hover:scale-105 transition-transform duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <motion.div
              className="w-32 h-32 rounded-full overflow-hidden bg-default-100"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar
                size="sm"
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="text-center">
              <h4 className="text-xl font-semibold">{member.name}</h4>
              <p className="text-default-500">{member.role}</p>
            </div>
            <div className="flex space-x-4">
              <motion.a
                href={member.socialLinks.facebook}
                aria-label="Facebook"
                whileHover={{ scale: 1.2, color: '#E1306C' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-sage-600 dark:text-sage-400"
              >
                <FaFacebook size={20} />
              </motion.a>
              <motion.a
                href={member.socialLinks.twitter}
                aria-label="Twitter"
                whileHover={{ scale: 1.2, color: '#E1306C' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-sage-600 dark:text-sage-400"
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a
                href={member.socialLinks.instagram}
                aria-label="Instagram"
                whileHover={{ scale: 1.2, color: '#E1306C' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-sage-600 dark:text-sage-400"
              >
                <FaInstagram size={20} />
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
