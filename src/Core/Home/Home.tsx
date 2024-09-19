import React, { ReactElement } from 'react';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import NavBar from 'src/Core/Home/components/NavBar';
import Introductions from 'src/Core/Home/components/Introductions';
import ProductPreview from 'src/Core/Home/components/ProductPreview';
import Clients from 'src/Core/Home/components/Clients';
import DetailedFeatures from 'src/Core/Home/components/DetailedFeatures';
import Footer from 'src/Core/Home/components/Footer';

const Home = (): ReactElement => (
  <VStack width="full">
    <NavBar />
    <VStack width="full">
      <VStack className="w-1/2" height="xl" justifyContent="center">
        <Heading lineHeight="1.5" fontSize="4xl" textAlign="center">
          The all-in-one platform for data collection and transparency
        </Heading>
        <Text lineHeight="2.5" textAlign="center">
          Manage your data collection with ease. The Igbo API Editor Platform delivers a powerful suite for data
          collection, annotating, labeling, managing, and exporting.
        </Text>
        <Button size="lg">Request access</Button>
      </VStack>
    </VStack>
    <ProductPreview />
    <Clients />
    <Introductions />
    <DetailedFeatures />
    <Footer />
  </VStack>
);

export default Home;
