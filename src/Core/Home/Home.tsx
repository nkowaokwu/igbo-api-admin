import React, { ReactElement } from 'react';
import { VStack } from '@chakra-ui/react';
import NavBar from 'src/Core/Home/components/NavBar';
import Hero from 'src/Core/Home/components/Hero';
import Introductions from 'src/Core/Home/components/Introductions';
import UseCases from 'src/Core/Home/components/UseCases';
import ProductPreview from 'src/Core/Home/components/ProductPreview';
// import Clients from 'src/Core/Home/components/Clients';
import DetailedFeatures from 'src/Core/Home/components/DetailedFeatures';
import JoinCommunity from 'src/Core/Home/components/JoinCommunity';
import Footer from 'src/Core/Home/components/Footer';

const Home = (): ReactElement => (
  <VStack width="full" spacing={0}>
    <NavBar />
    <Hero />
    <ProductPreview />
    {/* <Clients /> */}
    <Introductions />
    <UseCases />
    <DetailedFeatures />
    <JoinCommunity />
    <Footer />
  </VStack>
);

export default Home;
