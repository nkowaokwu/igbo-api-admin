/* eslint-disable max-len */
import React, { useState, ReactElement, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Tag,
} from '@chakra-ui/react';
import moment from 'moment';
import { FiClock, FiClipboard, FiZap, FiSliders, FiBookOpen, FiSmile } from 'react-icons/fi';
import UserPersona from 'src/backend/shared/constants/UserPersona';

import UserRoles from '../backend/shared/constants/UserRoles';

export interface SignupInfo {
  email: string;
  password: string;
  displayName: string;
  role: UserRoles.USER;
}

const userPersonalToggleOptions = [
  { label: 'Individual', value: UserPersona.INDIVIDUAL },
  { label: 'Team', value: UserPersona.TEAM },
];

const individualFeatures = [
  {
    title: 'Directly Contribute to World-Class AI',
    description:
      'By contributing to the largest Igbo dataset, you will be directly improving various AI tools that we support.',
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Track Personal Contributions',
    description: 'Easily see all personal contributions you have made to the open-source Igbo API dataset.',
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Receive Mentions',
    description: 'Get mentioned as a consistent contributor for future releases of Igbo API datasets.',
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Join a Growing Community',
    description:
      "Join our Slack community to meet other excited Igbo contributors. We're also on Hugging Face, Kaggle, and LinkedIn.",
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
];

const teamFeatures = [
  {
    title: 'Tailor-made Features',
    description:
      'The Nkọwa okwu Data Platform is made specifically with Nigerian languages in mind. That includes beginner friendly data collection features to advanced lexical data collection features.',
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Monitor Progress',
    description:
      "Project owners have the ability to track their team's progress. From tracking number of approvals, published documents, to drafts created, project owners can confident monitor project as it progresses.",
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Content Validation',
    description:
      "The data platform enables team members to approve or deny work before it gets labeled as published or finalized, ensuring that final published data meets each team's standards.",
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Manage Teams',
    description:
      'Project owners can invite members to their project and assign user roles to ensure the right people have the right access to data.',
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
  {
    title: 'Export Data',
    description: "Seamlessly export your team's collected data to power your projects.",
    image:
      'https://file.notion.so/f/f/ed5c5265-c308-4763-b908-312ba1ea2852/2f719641-b7be-4bb1-87d6-c3562d8fc3f8/Xnapper-2024-09-04-22.08.38.png?table=block&id=6b49a156-2ab4-4292-b743-c4eeb8cb055e&spaceId=ed5c5265-c308-4763-b908-312ba1ea2852&expirationTimestamp=1725825600000&signature=r1thFv7oxPLg2rJC5aM35F3Pm05022eDR1l40ezRRac&downloadName=Xnapper-2024-09-04-22.08.38.png',
  },
];

const benefits = [
  {
    title: 'Manage less',
    description:
      'The Nkọwa okwu Data Platform is specially designed to collect Nigerian data. Each feature considers Nigerian language and culture making it easier for you and your team to contribute.',
    icon: <FiClock size={30} />,
  },
  {
    title: 'Collaborate with professionals',
    description:
      'The data platform is built for researchers, translators, linguists, lexicographers, historians, archivists, and more. If you want to collect Nigerian data, this is the platform.',
    icon: <FiClipboard size={30} />,
  },
  {
    title: 'Power your projects',
    description:
      'By being able to export your collected data, the data platform enables teams to utilize their data for other Nigerian-specific projects',
    icon: <FiZap size={30} />,
  },
  {
    title: 'Control your data',
    description:
      'The data platform makes it easy for you to define the copyright license, how to export data, and who should be able to edit your data.',
    icon: <FiSliders size={30} />,
  },
  {
    title: 'Detailed lexical support',
    description:
      'The data platform makes it possible for teams to get specific with their data. Teams can add dialectal-specific data, spelling variations, word stems, related terms, and more.',
    icon: <FiBookOpen size={30} />,
  },
  {
    title: 'Team support',
    description:
      'Nkọwa okwu is dedicated to listening to our users to learn how to constantly improve the quality of the Nkọwa okwu Data Platform.',
    icon: <FiSmile size={30} />,
  },
];

const faqs = [
  {
    question: 'How much does it cost to use the Nkọwa okwu Data Platform?',
    answer: "It's complete free for small teams and individuals. For large teams and organizations, please contact us.",
  },
  {
    question: 'What kind of data can I contribute?',
    answer:
      'There are three main types of data you can contribute: text, audio, and image data. With each type of data, you can provide more specific metadata and annotations.',
  },
  {
    question: 'Which Nigerian languages are supported?',
    answer: 'Currently, we only support Igbo. We have plans to support Yoruba, Hausa, and Pidgin.',
  },
  {
    question: 'How can my data be used?',
    answer:
      "Individual contributors can contribute to the Nkọwa okwu data to further improve the Igbo API and the data platform. Team projects's can assign their own copyright licenses for future use.",
  },
];

const Login = (): ReactElement => {
  const [currentUserPersona, setCurrentUserPersona] = useState(UserPersona.INDIVIDUAL);
  const [currentFeatures, setCurrentFeatures] = useState(individualFeatures);

  const handleGetStarted = () => {
    window.location.hash = '#/getting-started';
  };

  useEffect(() => {
    if (currentUserPersona === UserPersona.INDIVIDUAL) {
      setCurrentFeatures(individualFeatures);
    } else {
      setCurrentFeatures(teamFeatures);
    }
  }, [currentUserPersona]);

  return (
    <VStack height="100vh" gap={16}>
      <HStack
        width="full"
        justifyContent="space-between"
        backgroundColor="#417453"
        backgroundImage="url('https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/pattern.png')"
        backgroundSize="82px 44px"
        p={2}
      >
        <HStack>
          <Image
            src="https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/logo.svg"
            alt="Nkowa okwu logo"
            filter="invert(1)"
            width="160px"
          />
          <Heading as="h1" fontFamily="Silka" fontSize="2xl" color="white">
            Data Platform
          </Heading>
        </HStack>
        <Button variant="primary" backgroundColor="purple.500" color="white" onClick={handleGetStarted}>
          Sign In
        </Button>
      </HStack>
      <VStack gap={4} p={4} className="w-10/12">
        <Heading as="h1" fontSize="6xl" textAlign="center">
          Collecting Nigerian Data at Scale
        </Heading>
        <Text fontSize="lg" textAlign="center" className="w-10/12 lg:w-1/2">
          Streamline your Nigerian data collection projects with our user-friendly platform. Teams can leverage our
          platform to effectively manage and monitor every aspect of their projects, ensuring efficient data gathering
          and analysis.
        </Text>
        <Button variant="primary" backgroundColor="purple.500" color="white" size="lg" onClick={handleGetStarted}>
          Get Started Now
        </Button>
      </VStack>
      <VStack gap={6}>
        <Heading as="h2">Explore Platform Features</Heading>
        <HStack borderWidth="1px" borderColor="gray.300" p={1} borderRadius="3xl">
          {userPersonalToggleOptions.map(({ label, value }) => (
            <Tag
              key={label}
              variant="outline"
              borderRadius="full"
              cursor="pointer"
              backgroundColor={value === currentUserPersona ? 'purple.200' : 'white'}
              color={value === currentUserPersona ? 'purple.700' : 'gray.800'}
              boxShadow={value === currentUserPersona ? 'none' : ''}
              size="lg"
              onClick={() => setCurrentUserPersona(value)}
            >
              {label}
            </Tag>
          ))}
        </HStack>
      </VStack>
      <VStack className="w-10/12" gap={12}>
        <VStack width="full" gap={12} p={4}>
          {currentFeatures.map(({ title, description, image }, index) => (
            <HStack
              key={title}
              width="full"
              justifyContent="space-between"
              flexDirection={index % 2 ? 'row-reverse' : 'row'}
            >
              <VStack key={title} alignItems="start" className="w-1/2">
                <Heading as="h2" fontSize="4xl">
                  {title}
                </Heading>
                <Text fontSize="lg">{description}</Text>
              </VStack>
              <Box
                height="400px"
                width="500px"
                backgroundColor="transparent"
                borderRadius="md"
                backgroundImage={image}
                backgroundSize="contain"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
              />
            </HStack>
          ))}
        </VStack>
        <Heading as="h2">Contributor Benefits</Heading>
        <Box className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8" p={4}>
          {benefits.map(({ title, description, icon }) => (
            <HStack key={title} gap={4} alignItems="flex-start">
              <Box
                height="100px"
                width="100px"
                backgroundColor="gray.200"
                borderRadius="md"
                flex={2}
                className="flex justify-center items-center"
              >
                {icon}
              </Box>
              <VStack alignItems="start" flex={5}>
                <Text fontWeight="bold">{title}</Text>
                <Text>{description}</Text>
              </VStack>
            </HStack>
          ))}
        </Box>
      </VStack>
      <VStack width="full" backgroundColor="gray.100">
        <Heading as="h2">Frequently Asked Question</Heading>
        <Accordion width="full">
          {faqs.map(({ question, answer }) => (
            <AccordionItem key={question}>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  <Text fontWeight="bold">{question}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>{answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
      <Text as="p" color="gray.100" fontSize="md">
        {`© ${moment().year()} Nkọwa okwu. All rights reserved.`}
      </Text>
    </VStack>
  );
};

export default Login;
