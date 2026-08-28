import { useState } from "react";
import heroImg from "@/assets/monolith-hero.jpg";
import detail1 from "@/assets/monolith-detail-1.jpg";
import detail2 from "@/assets/monolith-detail-2.jpg";

const images = [heroImg, detail1, detail2];

export function ProductGallery() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-md bg-muted">
        <img
          src={images[active]}
          alt="Monolith Series 01"
          width={1280}
          height={1280}
          className="aspect-square w-full object-cover transition-opacity duration-500"
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`overflow-hidden rounded-md border-2 transition-all ${
              active === i ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            <img
              src={src}
              alt={`View ${i + 1}`}
              width={400}
              height={400}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
