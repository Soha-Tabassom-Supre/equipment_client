"use client";

import { ArrowUpRight, MapPin, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  location: string;
  condition: string;
  images: string[];
  status: string;
}

interface EquipmentCardProps {
  item: Equipment;
}

export default function EquipmentCard({ item }: EquipmentCardProps) {
  const router = useRouter();

  const image = item.images?.[0];

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl specular-card transition duration-300 hover:-translate-y-1 hover:border-[#7aa2f7]/50">
     
      <div className="relative h-52 w-full overflow-hidden bg-[var(--bg-elevated)]">
        {image ? (
          <img
            src={image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-14 w-14 text-slate-600" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/85 via-transparent to-transparent" />

       
        <span className="absolute left-3 top-3 rounded-lg border border-white/15 bg-[#0a0e14]/75 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-md">
          {item.category}
        </span>

      
        <div className="absolute bottom-3 left-3 rounded-xl border border-white/15 bg-[#0a0e14]/85 px-3 py-1 backdrop-blur-md">
          <span className="font-mono text-base font-bold text-[#7dcfff]">
            ৳{item.pricePerDay.toLocaleString("en-BD")}
          </span>
          <span className="text-[11px] text-slate-300"> / day</span>
        </div>
      </div>

  
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
              <MapPin className="h-3.5 w-3.5 text-[#7aa2f7]" />
              {item.location}
            </span>

            <span className="font-mono text-[11px] text-emerald-400">
              Approved
            </span>
          </div>

          <h3 className="line-clamp-1 text-base font-semibold text-[var(--text-primary)]">
            {item.name}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            {item.description}
          </p>

          <p className="text-xs text-[var(--text-secondary)]">
            Condition: {item.condition}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/equipment/${item._id}`)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7aa2f7] to-[#638df2] px-4 py-2.5 text-xs font-semibold text-[#0a0e14] transition hover:brightness-110"
        >
          View Details
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
