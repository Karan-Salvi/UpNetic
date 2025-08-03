import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Connection from "../models/Connection.js";

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://karan:karan123@cluster0.ngzbnha.mongodb.net/mini-linkedin"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Connection.deleteMany({});
    console.log("Cleared existing data");

    // Create demo users
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const hashedUserPassword = await bcrypt.hash("user123", 12);

    const users = [
      {
        name: "Admin User",
        email: "admin@demo.com",
        password: hashedPassword,
        headline: "Platform Administrator",
        bio: "Managing the Mini LinkedIn platform and ensuring great user experience.",
        location: "San Francisco, CA",
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAdmin: true,
        skills: ["Leadership", "Management", "Strategy"],
        connections: [],
        experience: [
          {
            title: "Platform Administrator",
            company: "Mini LinkedIn",
            startDate: new Date("2024-01-01"),
            current: true,
            description: "Overseeing platform operations and user experience",
          },
        ],
      },
      {
        name: "Demo User",
        email: "user@demo.com",
        password: hashedUserPassword,
        headline: "Software Developer",
        bio: "Passionate full-stack developer with experience in React, Node.js, and modern web technologies.",
        location: "New York, NY",
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
        isAdmin: false,
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        connections: [],
        experience: [
          {
            title: "Software Developer",
            company: "Tech Corp",
            startDate: new Date("2023-01-01"),
            current: true,
            description:
              "Developing web applications using modern technologies",
          },
        ],
      },
      {
        name: "Sarah Johnson",
        email: "sarah@demo.com",
        password: hashedUserPassword,
        headline: "Product Manager at InnovaCorp",
        bio: "Experienced product manager focused on user-centric design and agile methodologies.",
        location: "Austin, TX",
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
        skills: ["Product Management", "Agile", "User Research"],
        connections: [],
        experience: [
          {
            title: "Product Manager",
            company: "InnovaCorp",
            startDate: new Date("2022-06-01"),
            current: true,
            description: "Leading product development and strategy",
          },
        ],
      },
      {
        name: "Michael Chen",
        email: "michael@demo.com",
        password: hashedUserPassword,
        headline: "UX Designer & Researcher",
        bio: "Creating intuitive and beautiful user experiences through research-driven design.",
        location: "Seattle, WA",
        avatar:
          "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
        skills: ["UX Design", "User Research", "Prototyping", "Figma"],
        connections: [],
        experience: [
          {
            title: "Senior UX Designer",
            company: "DesignFlow",
            startDate: new Date("2023-03-01"),
            current: true,
            description:
              "Leading design projects and user research initiatives",
          },
        ],
      },
      {
        name: "Emily Rodriguez",
        email: "emily@demo.com",
        password: hashedUserPassword,
        headline: "Marketing Director",
        bio: "Digital marketing expert with a passion for building brand awareness and driving growth.",
        location: "Los Angeles, CA",
        avatar:
          "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
        skills: ["Digital Marketing", "Brand Strategy", "Content Marketing"],
        connections: [],
        experience: [
          {
            title: "Marketing Director",
            company: "GrowthCo",
            startDate: new Date("2022-01-01"),
            current: true,
            description: "Developing and executing marketing strategies",
          },
        ],
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create sample posts
    const posts = [
      {
        content:
          "Welcome to Mini LinkedIn! 🎉 Excited to connect with amazing professionals and share insights about technology, career growth, and innovation. Looking forward to building meaningful connections! #UpNetic #Networking #Tech",
        author: createdUsers[0]._id,
        tags: ["networking", "tech", "career"],
        likes: [createdUsers[1]._id, createdUsers[2]._id],
        comments: [
          {
            content:
              "Welcome to the platform! Looking forward to connecting with everyone.",
            author: createdUsers[1]._id,
          },
        ],
        viewCount: 15,
        engagementScore: 8,
      },
      {
        content:
          "Just finished working on a challenging React project! 💻 The new hooks and context API made state management so much cleaner. Always amazed by how much React continues to evolve. What's your favorite React feature? #React #JavaScript #WebDevelopment",
        author: createdUsers[1]._id,
        tags: ["react", "javascript", "webdev"],
        likes: [createdUsers[0]._id, createdUsers[3]._id],
        comments: [
          {
            content:
              "Great work! React hooks have definitely revolutionized how we write components.",
            author: createdUsers[3]._id,
          },
        ],
        viewCount: 23,
        engagementScore: 12,
      },
      {
        content:
          "Product management tip: Always validate your assumptions with real user data 📊 Spent the morning analyzing user feedback and discovered some surprising insights that will shape our next sprint. Data-driven decisions are game changers! #ProductManagement #UserResearch #DataDriven",
        author: createdUsers[2]._id,
        tags: ["product", "userresearch", "data"],
        likes: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[4]._id],
        comments: [
          {
            content:
              "Absolutely! User feedback is invaluable for product success.",
            author: createdUsers[4]._id,
          },
        ],
        viewCount: 31,
        engagementScore: 18,
      },
      {
        content:
          "Design thinking workshop was incredible today! 🎨 Collaborated with cross-functional teams to solve complex user problems. The power of diverse perspectives in design cannot be overstated. #UXDesign #DesignThinking #Collaboration",
        author: createdUsers[3]._id,
        tags: ["ux", "design", "collaboration"],
        likes: [createdUsers[2]._id],
        comments: [],
        viewCount: 19,
        engagementScore: 7,
      },
      {
        content:
          "Marketing in 2024 is all about authenticity and value creation 🚀 Consumers are smarter than ever and can spot inauthentic content from miles away. Focus on providing real value and building genuine relationships. #Marketing #Authenticity #Value",
        author: createdUsers[4]._id,
        tags: ["marketing", "authenticity", "strategy"],
        likes: [createdUsers[0]._id, createdUsers[2]._id],
        comments: [
          {
            content:
              "So true! Authentic marketing always wins in the long run.",
            author: createdUsers[0]._id,
          },
        ],
        viewCount: 27,
        engagementScore: 14,
      },
    ];

    const createdPosts = await Post.insertMany(posts);
    console.log(`Created ${createdPosts.length} posts`);

    // Create some connections
    const connections = [
      {
        requester: createdUsers[0]._id,
        recipient: createdUsers[1]._id,
        status: "accepted",
        acceptedAt: new Date(),
      },
      {
        requester: createdUsers[1]._id,
        recipient: createdUsers[2]._id,
        status: "accepted",
        acceptedAt: new Date(),
      },
      {
        requester: createdUsers[2]._id,
        recipient: createdUsers[3]._id,
        status: "accepted",
        acceptedAt: new Date(),
      },
      {
        requester: createdUsers[3]._id,
        recipient: createdUsers[4]._id,
        status: "pending",
      },
    ];

    await Connection.insertMany(connections);
    console.log(`Created ${connections.length} connections`);

    // Update users' connections arrays for accepted connections
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      $push: { connections: createdUsers[1]._id },
    });
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { connections: [createdUsers[0]._id, createdUsers[2]._id] },
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { connections: [createdUsers[1]._id, createdUsers[3]._id] },
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $push: { connections: createdUsers[2]._id },
    });

    console.log("✅ Seed data created successfully!");
    console.log("\n📧 Demo Login Credentials:");
    console.log("Admin: admin@demo.com / admin123");
    console.log("User: user@demo.com / user123");
    console.log("\n🌐 Additional demo users:");
    console.log("Sarah: sarah@demo.com / user123");
    console.log("Michael: michael@demo.com / user123");
    console.log("Emily: emily@demo.com / user123");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedData();
