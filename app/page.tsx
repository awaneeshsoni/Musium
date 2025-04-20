"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { motion, useScroll, useTransform, Variants, useAnimation, useInView } from 'framer-motion';
import {
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";


const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const brands = [
  '/logeo.jpeg',
  '/logeo.jpeg',
  '/logeo.jpeg',
  '/logeo.jpeg',
  '/logeo.jpeg',
  '/logeo.jpeg',
];

const problems = [
  {
    title: "Writer's Block",
    description: "Staring at a blank page? Museium helps you break through creative barriers and find your flow.",
    image: "/diagnosis.svg",
  },
  {
    title: "Disorganized Thoughts",
    description: "Struggling to structure your ideas? Museium provides a clear space to organize and connect your thoughts.",
    image: "/care-cost.svg",
  },
  {
    title: "Distractions Abound",
    description: "Can't focus on writing? Museium offers a distraction-free environment to cultivate deep work.",
    image: "/no-personalization.svg",
  },
];


const features = [
  {
    title: "AI-Powered Prompts",
    description:
      "Stuck for ideas? Get AI-generated prompts tailored to your style and genre to spark inspiration.",
    image: "/reminders.svg",
    step: "01",
  },
  {
    title: "Contextual Research",
    description:
      "Effortlessly research and reference information without leaving your writing space.",
    image: "/fall-detection.svg",
    step: "02",
  },
  {
    title: "Seamless Editing",
    description:
      "Edit and refine your work with integrated grammar and style suggestions to polish your prose.",
    image: "/gps.svg",
    step: "03",
  },
  {
    title: "Zen Mode",
    description:
      "Immerse yourself in a distraction-free writing environment with customizable themes and focus tools.",
    image: "/activities.svg",
    step: "04",
  },
];


const Counter = ({ end, label }: { end: number; label: string }) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1000;
      const step = end / (duration / 16);

      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setCount(Math.floor(start));
      }, 16);

      return () => clearInterval(interval);
    }
  }, [end, isInView]);

  return (
    <div className="text-center" ref={ref}>
      <p className="text-4xl sm:text-5xl font-bold text-propeink-600">{count}+</p>
      <p className="text-sm sm:text-base text-gray-600 mt-1">{label}</p>
    </div>
  );
};



const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const circleY = useTransform(scrollYProgress, [0, 1], ['60%', '-50%']);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const blurFilter = useTransform(blur, (val) => `blur(${val}px)`);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 1, 1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const controls = useAnimation();



  useEffect(() => {
    if (carouselRef.current) {
      setContainerWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const animateCarousel = async () => {
      await controls.start({
        x: -containerWidth,
        transition: {
          loop: Infinity,
          duration: 20,
          ease: 'linear',
        },
      });
    };

    animateCarousel();

    return () => {
      controls.stop();
    };
  }, [containerWidth, controls]);



  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="font-serif">
      {/* Navbar */}
      <nav className="bg-transparent fixed top-0 left-0 w-full z-50  ">
        <div className="  container mx-auto py-4 px-6 flex items-center justify-between bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-20 rounded-xl shadow-lg">

          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.jpeg"
              alt="Company Logo"
              width={35}
              height={35}
              className=""
            />
          </Link>


          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-gray-900">
              Services
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>

          </div>


          <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>


          <div
            className={`md:hidden absolute top-full left-0 w-full bg-white bg-opacity-90 backdrop-blur-md py-4 px-6 ${isOpen ? 'block' : 'hidden'
              }`}
          >
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-black hover:text-gray-900 block">
                Home
              </Link>
              <Link href="/blog" className="text-black hover:text-gray-900 block">
                Blog
              </Link>
              <Link href="/about" className="text-black hover:text-gray-900 block">
                About
              </Link>
              <Link href="/contactus" className="text-black hover:text-gray-900 block">
                Contact Us
              </Link>

            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={containerRef}
        className="relative min-h-screen bg-white flex items-center justify-center overflow-visible mt-20"
      >
        {/* Background blob */}
        <div className="absolute top-0 left-0 w-full h-1/2 md:h-2/3 lg:h-full overflow-visible pointer-events-none z-0">
          <motion.div
            style={{
              y: circleY,
              filter: blurFilter,
              position: 'absolute',
              bottom: '-120%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '160vw',
              maxWidth: '250vh',
              maxHeight: '200vh',
              transformOrigin: 'top center',
            }}
            className="shadow-[inset_0px_0px_75px_-15px_rgba(255,255,255,0.4)] rounded-full bg-gradient-to-b from-[#001aff] to-transparent"
          />
        </div>

        {/* Main content */}
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between z-10 relative px-4 sm:px-8 py-12">
          {/* Text content */}
          <motion.div
            className="w-full lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 lg:pl-12"
            style={{
              opacity: contentOpacity,
              y: contentY,
              filter: 'blur(0.2rem)',
            }}
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
              A Place for Your Self-Musings
            </h1>
            <p className="text-gray-600 text-sm md:text-base mb-6">
              Musium is a calm, distraction-free space for writing and sharing your thoughts. Write privately or post publicly — your words, your rhythm.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow hover:from-blue-600 hover:to-blue-700 transition"
              >
                Log In
              </a>
              <a
                href="/signup"
                className="px-4 py-2 text-sm font-medium rounded-md bg-white text-blue-600 border border-blue-500 shadow-sm hover:bg-blue-50 transition"
              >
                Sign Up
              </a>
              <a
                href="/posts/6804b010585ed680fd92711b"
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                Sample Post
              </a>
            </div>
          </motion.div>

          {/* Image content */}
          <motion.div
            className="w-full lg:w-4/5 xl:w-5/6 mx-auto backdrop-blur-md bg-white/50 border border-white/20 shadow-xl rounded-2xl p-4"
            style={{
              opacity: contentOpacity,
              y: contentY,
              filter: 'blur(0.2rem)',
            }}
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Image
              src="/editor.png"
              alt="Editor Preview"
              width={1200}
              height={800}
              className="w-full h-auto object-contain rounded-xl"
            />
          </motion.div>
        </div>
      </section>



      {/* Traction Section */}
      <motion.section
        className="py-16 bg-gray-50 overflow-hidden"
        variants={fadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-propeink-900 mb-10"
          >
            Trusted by
          </motion.h2>

          <motion.div
            ref={carouselRef}
            className="relative w-full overflow-hidden whitespace-nowrap"
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="flex"
              style={{ x: 0 }}
              animate={controls}
            >
              {brands.concat(brands).map((src, index) => (
                <div key={index} className="flex-shrink-0 w-40 sm:w-48">
                  <Image
                    src={src}
                    alt={`Brand ${index + 1}`}
                    width={192}
                    height={64}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Counter end={5000} label="Words Written" />
            <Counter end={1000} label="Active Users" />
            <Counter end={100} label="Stories Started" />
          </div>
        </div>
      </motion.section>

      {/* Problem Section */}
      <motion.section
        className="py-20 bg-gradient-to-b from-white to-slate-100"
        variants={fadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-propeink-900 mb-4"
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            The Challenges Writers Face
          </motion.h2>
          <motion.p
            className="text-propeink-800 text-lg max-w-2xl mx-auto mb-12"
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            We understand the struggles writers face daily. Museium is designed to overcome these challenges.
          </motion.p>

          <div className="grid gap-8 md:grid-cols-3">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white border border-propeink-100 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-propeink-900 mb-2">{item.title}</h3>
                <p className="text-propeink-700 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <section className="w-full bg-gradient-to-br from-white to-gray-100 py-16 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-propeink-800 mb-4">
            Key Features for Inspired Writing
          </h2>
          <p className="text-center text-gray-700 max-w-2xl mx-auto mb-12">
            Explore the range of tools and technologies Museium offers to enhance your writing experience.
          </p>

          <div className="flex overflow-x-auto space-x-6 snap-x snap-mandatory scrollbar-hide">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[260px] h-[420px] bg-white rounded-3xl shadow-lg p-6 snap-start flex flex-col justify-between border border-propeink-200"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-propeink-100 text-propeink-800 font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm">
                      {feature.step}
                    </div>
                    <h3 className="text-lg font-semibold text-propeink-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-auto">
                  {/* <Image
                    src={feature.image}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="object-contain"
                  /> */}
                  <button className="text-propeink-600 text-sm font-medium hover:underline">
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-propeink-200 to-propeink-100 text-black py-12 px-4">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-xl font-semibold mb-4 text-black">Contact</h3>
            <p className="mb-2 text-black">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-black" />
              <a href="mailto:hello@yourdomain.com" className="hover:text-propeink-700 transition-colors">hello@yourdomain.com</a>
            </p>
            <p className="mb-2 text-black">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-black" />
              +1 (234) 567-890
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-propeink-500 transition-colors">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="#" className="hover:text-propeink-500 transition-colors">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#" className="hover:text-propeink-500 transition-colors">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="hover:text-propeink-500 transition-colors">
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </div>
          </div>

          <div>
            <div className="flex gap-3 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.jpeg"
                  alt="Company Logo"
                  width={35}
                  height={35}
                  className=""
                />
                <span className='ml-1 text-2xl' >Musium</span>
              </Link>
            </div>
            <p className="text-black leading-relaxed mb-4">
              Your personal writing sanctuary, designed to inspire, organize, and refine your thoughts into compelling stories.
            </p>
          </div>
          <div>

            <ul className="list-none">
              <li><Link href="/" className="hover:text-propeink-700 transition-colors">Home</Link></li>
              <li><Link href="/blog" className="hover:text-propeink-700 transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-propeink-700 transition-colors">About Us</Link></li>
              <li><Link href="/contactus" className="hover:text-propeink-700 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-propeink-200 mt-12 pt-6 text-center text-sm text-black">
          © {new Date().getFullYear()} Musium. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;