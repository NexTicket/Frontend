'use client';

import React from 'react';
import { Mail, Phone, Github, Linkedin, MapPin, Clock } from 'lucide-react';

interface Developer {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  image: string;
  bio: string;
  specialties: string[];
}

const developers: Developer[] = [
  {
    id: 1,
    name: "Deepthi Damruwan",
    role: "Full Stack Developer & Project Lead",
    email: "alex.thompson@nexticket.com",
    phone: "+94 77 123 4567",
    github: "https://github.com/alexthompson",
    linkedin: "https://linkedin.com/in/alexthompson",
    image: "/Images/profile-avatar-account-icon.png",
    bio: "Lead developer with 5+ years of experience in React, Node.js, and cloud architecture. Passionate about creating scalable and user-friendly applications.",
    specialties: ["React", "Node.js", "AWS", "TypeScript", "Database Design"]
  },
  {
    id: 2,
    name: "Deepthi Damruwan",
    role: "Frontend Developer & UI/UX Designer",
    email: "sarah.chen@nexticket.com",
    phone: "+94 76 234 5678",
    github: "https://github.com/sarahchen",
    linkedin: "https://linkedin.com/in/sarahchen",
    image: "/Images/profile-avatar-account-icon.png",
    bio: "Creative frontend developer specializing in responsive design and user experience. Expert in modern CSS frameworks and design systems.",
    specialties: ["React", "Tailwind CSS", "Figma", "Animation", "Responsive Design"]
  },
  {
    id: 3,
    name: "Deepthi Damruwan",
    role: "Backend Developer & DevOps Engineer",
    email: "michael.rodriguez@nexticket.com",
    phone: "+94 75 345 6789",
    github: "https://github.com/michaelrodriguez",
    linkedin: "https://linkedin.com/in/michaelrodriguez",
    image: "/Images/profile-avatar-account-icon.png",
    bio: "Backend specialist focused on API development, microservices, and infrastructure automation. Expert in scalable server architecture.",
    specialties: ["Node.js", "MongoDB", "Docker", "CI/CD", "API Development"]
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions about NexTicket? Want to collaborate or report an issue? 
            Our development team is here to help you.
          </p>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">support@nexticket.com</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+94 1234 5678</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">Colombo, Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Development Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The talented individuals behind NexTicket. We're passionate about creating 
              exceptional digital experiences for event management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((developer) => (
              <div key={developer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Profile Image */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="w-16 h-16 rounded-full border-4 border-white bg-white"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 pb-8 px-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{developer.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{developer.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {developer.bio}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {developer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <a href={`mailto:${developer.email}`} className="hover:text-blue-600 transition-colors">
                        {developer.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <a href={`tel:${developer.phone}`} className="hover:text-blue-600 transition-colors">
                        {developer.phone}
                      </a>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4 mt-6 pt-6 border-t border-gray-100">
                    <a
                      href={developer.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href={developer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Office Hours Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Office Hours</h3>
            <div className="text-gray-600 space-y-2">
              <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM (GMT+5:30)</p>
              <p><span className="font-semibold">Saturday:</span> 10:00 AM - 2:00 PM (GMT+5:30)</p>
              <p><span className="font-semibold">Sunday:</span> Closed</p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              We typically respond to emails within 24 hours during business days.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust NexTicket for their ticketing needs.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/auth/signup"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/events"
              className="inline-block border border-gray-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Events
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
