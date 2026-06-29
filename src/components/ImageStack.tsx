'use client';

import Image from 'next/image';

const profileImages = [1, 2, 3, 4, 5];

const floatClasses = [
  'hero-float-1', 'hero-float-2', '', 'hero-float-4', 'hero-float-5',
];

const ImageStack = () => {
  return (
    <div className="relative w-full lg:w-[55%] h-[50vh] sm:h-[70vh] lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden flex items-center justify-center lg:justify-end lg:pr-24">
      {profileImages.map((num, i) => (
        <div
          key={num}
          className={`absolute inset-0 flex items-center justify-center lg:justify-end pr-0 sm:pr-8 lg:pr-24 ${floatClasses[i]}`}
        >
          <Image
            src={`/images/profile/${num}.png`}
            alt={`Handpan ${num}`}
            width={1200}
            height={1500}
            className="object-contain h-[50vh] sm:h-[60vh] lg:h-[90vh] w-auto origin-center scale-[1.15] sm:scale-105 lg:scale-100"
            sizes="(max-width: 640px) 120vw, (max-width: 1024px) 90vw, 55vw"
            priority={i < 2}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageStack;
