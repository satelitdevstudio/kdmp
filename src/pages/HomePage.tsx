import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Products from '../components/Products';
import Features from '../components/Features';
import EventsAndTV from '../components/EventsAndTV';
import Promotions from '../components/Promotions';
import NewsAndStories from '../components/NewsAndStories';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <Products />
      <Features />
      <EventsAndTV />
      <Promotions />
      <NewsAndStories />
    </>
  );
}
