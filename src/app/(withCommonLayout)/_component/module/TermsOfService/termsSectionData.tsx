import {
  BookOpen,
  Users,
  Globe,
  MessageCircle,
  Compass,
  Camera,
  Star,
  Shield,
  AlertTriangle,
  Scale,
  HeartHandshake,
} from "lucide-react";

export const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <p>
        Welcome to Aura Trip. By accessing our website or
        using our services, you agree to comply with and be bound by the
        following terms and conditions. Please read these Terms of Service
        carefully before using our platform.
      </p>
    ),
    icon: <BookOpen size={24} />,
  },
  {
    id: "account-registration",
    title: "Account Registration",
    content: (
      <>
        <p className="mb-2">
          To access certain features of our platform, you may be required to
          create an account. You are responsible for maintaining the
          confidentiality of your account information and for all activities
          that occur under your account.
        </p>
        <p>
          You must provide accurate and complete information when creating your
          account. We reserve the right to suspend or terminate accounts that
          violate our terms or community guidelines.
        </p>
      </>
    ),
    icon: <Shield size={24} />,
  },
  {
    id: "user-content",
    title: "User-Generated Content",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>You retain ownership of the content you post on our platform.</li>
        <li>
          By posting content, you grant us a non-exclusive, worldwide,
          royalty-free license to use, modify, and display your content for the
          purpose of operating and improving our services.
        </li>
        <li>
          You are solely responsible for the content you post and must not
          violate any third-party rights.
        </li>
        <li>
          We reserve the right to remove or modify user-generated content that
          violates our guidelines or terms.
        </li>
      </ul>
    ),
    icon: <Users size={24} />,
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    content: (
      <>
        <p className="mb-2">
          Our platform thrives on respectful and engaging interactions between
          travelers. To maintain a positive community, please adhere to the
          following guidelines:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Be respectful and courteous to other users.</li>
          <li>Share accurate and helpful travel information.</li>
          <li>Do not post offensive, harmful, or misleading content.</li>
          <li>Respect cultural sensitivities when discussing destinations.</li>
          <li>
            Avoid spam, excessive self-promotion, or commercial advertising
            without prior approval.
          </li>
        </ul>
      </>
    ),
    icon: <MessageCircle size={24} />,
  },
  {
    id: "travel-tips",
    title: "Travel Tips and Advice",
    content: (
      <p>
        While we strive to provide accurate and helpful travel tips and
        destination guides, we cannot guarantee the completeness, reliability,
        or accuracy of all information. Users should always verify important
        details with official sources and use their own judgment when making
        travel decisions based on information from our platform.
      </p>
    ),
    icon: <Compass size={24} />,
  },
  {
    id: "photo-sharing",
    title: "Photo Sharing",
    content: (
      <>
        <p className="mb-2">
          Sharing photos enhances the travel experience for our community. When
          sharing photos:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ensure you have the right to share the photo.</li>
          <li>
            Respect people is privacy and obtain permission when photographing
            individuals.
          </li>
          <li>Do not post inappropriate or offensive images.</li>
          <li>Add relevant captions or descriptions to provide context.</li>
        </ul>
      </>
    ),
    icon: <Camera size={24} />,
  },
  {
    id: "reviews-ratings",
    title: "Reviews and Ratings",
    content: (
      <p>
        Honest reviews and ratings are crucial for our community. When leaving
        reviews, be fair, accurate, and constructive. Do not post false or
        misleading reviews, or use reviews to blackmail or extort businesses. We
        reserve the right to remove reviews that violate our guidelines or
        appear fraudulent.
      </p>
    ),
    icon: <Star size={24} />,
  },
  {
    id: "third-party-links",
    title: "Third-Party Links and Services",
    content: (
      <p>
        Our platform may contain links to third-party websites or services. We
        are not responsible for the content, accuracy, or practices of these
        third-party sites. The inclusion of any links does not necessarily imply
        a recommendation or endorse the views expressed within them.
      </p>
    ),
    icon: <Globe size={24} />,
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <>
        <p className="mb-2">
          All content on Aura Trip, including but not
          limited to text, graphics, logos, and software, is the property of our
          company or our content suppliers and is protected by international
          copyright laws.
        </p>
        <p>
          Users may not reproduce, distribute, or create derivative works from
          this content without explicit permission from the copyright holder.
        </p>
      </>
    ),
    icon: <Shield size={24} />,
  },
  {
    id: "limitation-liability",
    title: "Limitation of Liability",
    content: (
      <p>
        Aura Trip shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages resulting from
        your use of our services. We do not endorse or guarantee the accuracy of
        user-generated content, and travelers should use their own judgment when
        making travel decisions based on information from our platform.
      </p>
    ),
    icon: <Scale size={24} />,
  },
  {
    id: "changes-terms",
    title: "Changes to Terms",
    content: (
      <p>
        We may update these Terms of Service from time to time to reflect
        changes in our services or legal requirements. We will notify users of
        significant changes via email or through a notice on our website. Your
        continued use of our platform after such changes constitutes acceptance
        of the updated terms.
      </p>
    ),
    icon: <AlertTriangle size={24} />,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <p>
        If you have any questions, concerns, or feedback regarding these Terms
        of Service or our platform, please do not hesitate to contact our
        support team. Were here to help ensure your experience with Aura Trip
        is positive and enriching.
      </p>
    ),
    icon: <HeartHandshake size={24} />,
  },
];
