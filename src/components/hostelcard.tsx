import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface HostelCardProps {
  id: string;
  name: string;
  type: string;
  image: string;
  distance: string;
  // Optional: receive seats info
  seatsAvailable?: number;
  seatsReserved?: number;
}

export default function HostelCard({ id, name, type, image, distance }: HostelCardProps) {
  return (
    <Link href={`/hostel/${id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 w-full max-w-sm flex flex-col">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
          {type}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          <span className="truncate">{distance}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
          <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Details 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}