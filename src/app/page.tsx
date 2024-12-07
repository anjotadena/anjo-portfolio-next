import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHtml5,
  faCss3Alt,
  faJs,
  faReact,
  faAngular,
  faVuejs,
  faNodeJs,
  faPython,
  faDocker,
  faAws,
} from "@fortawesome/free-brands-svg-icons";
import { faDatabase, faCogs } from "@fortawesome/free-solid-svg-icons";

const tools = [
  { name: "Angular", src: "/assets/tools/angular.png" },
  { name: "Next.js", src: "/assets/tools/nextjs.svg" },
  { name: "ASP.NET Core", src: "/assets/tools/aspcore.png" },
  { name: "AWS", src: "/assets/tools/aws.png" },
  { name: "Azure", src: "/assets/tools/azure.png" },
  { name: "MS SQL", src: "/assets/tools/mssql.png" },
  { name: "MySQL", src: "/assets/tools/mysql.png" },
  { name: "Laravel", src: "/assets/tools/laravel.png" },
  { name: "React Native", src: "/assets/tools/reactnative.png" },
  { name: "Wordpress", src: "/assets/tools/wordpress.png" },
  { name: "Golang", src: "/assets/tools/golang.png" },
];

export default function About() {
  return (
    <>
      <div className="pt-12">
        <img
          src="https://avatars.githubusercontent.com/u/12849968?v=4" /* Replace with your image path */
          alt="WordPress Consultant"
          width={200}
          height={200}
          className="object-cover rounded-[50%] mx-auto"
        />
        {/* GitHub */}
        <div className="flex align-center item-center justify-center py-8 gap gap-4">
          <a
            href="https://github.com/your-profile" /* Replace with your GitHub link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.799 8.207 11.387.6.11.793-.261.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.384-1.332-1.753-1.332-1.753-1.089-.745.082-.729.082-.729 1.205.085 1.839 1.238 1.839 1.238 1.07 1.835 2.809 1.305 3.495.998.108-.775.42-1.305.762-1.606-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.522.117-3.176 0 0 1.008-.323 3.3 1.23.957-.266 1.984-.399 3.006-.403 1.02.004 2.049.137 3.006.403 2.291-1.553 3.297-1.23 3.297-1.23.653 1.654.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.624-5.476 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.901-.014 3.292 0 .319.192.694.8.576C20.565 21.795 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {/* Twitter */}
          <a
            href="https://twitter.com/your-profile" /* Replace with your Twitter link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M24 4.557a9.834 9.834 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.957 13.957 0 0 1 1.671 3.149a4.92 4.92 0 0 0 1.524 6.573 4.903 4.903 0 0 1-2.23-.616c-.054 2.281 1.582 4.415 3.949 4.89a4.928 4.928 0 0 1-2.224.085 4.923 4.923 0 0 0 4.604 3.417 9.874 9.874 0 0 1-6.102 2.104c-.396 0-.788-.023-1.175-.068A13.933 13.933 0 0 0 7.548 21c9.056 0 14.01-7.502 14.01-14.01 0-.213-.004-.425-.013-.636A10.01 10.01 0 0 0 24 4.557z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/your-profile" /* Replace with your LinkedIn link */
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M22.225 0H1.771C.792 0 0 .772 0 1.721v20.456C0 23.228.792 24 1.771 24h20.451C23.208 24 24 23.228 24 22.177V1.721C24 .772 23.208 0 22.225 0zM7.121 20.452H3.563V9.04h3.558v11.412zM5.342 7.655c-1.146 0-2.075-.93-2.075-2.076S4.196 3.504 5.342 3.504s2.075.93 2.075 2.075c0 1.147-.93 2.076-2.075 2.076zM20.452 20.452h-3.558v-5.805c0-1.383-.027-3.162-1.926-3.162-1.926 0-2.221 1.505-2.221 3.059v5.908h-3.557V9.04h3.413v1.561h.049c.474-.896 1.632-1.839 3.36-1.839 3.591 0 4.253 2.362 4.253 5.437v6.253z" />
            </svg>
          </a>
        </div>
      </div>
      <section className="px-2 bg-white md:px-0">
        <div className="container items-center mx-auto">
          <h1 className="text-3xl text-center title-font font-regular text-2xl text-gray-900">
            Anjo Tadena | Software Engineer
          </h1>
          <p className="text-center w-full md:w-2/4 mx-auto mt-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis
            doloremque repudiandae voluptas iusto? Recusandae eius repellat
            ipsum fuga modi nihil qui neque accusamus. Tenetur deleniti fuga
            accusantium. Quae, alias obcaecati.
          </p>
          {/* <section className="text-gray-700 body-font">
            <h2 className="text-3xl text-center title-font font-regular text-2xl text-gray-900 mt-12">
              Why Work with Me?
            </h2>
            <div className="container px-5 pt-12 mx-auto">
              <div className="flex flex-wrap text-center justify-center">
                <div className="p-4 md:w-1/4 sm:w-1/2">
                  <div className="px-4 py-6 transform transition duration-500 hover:scale-110">
                    <div className="flex justify-center">
                      <img
                        src="https://image3.jdomni.in/banner/13062021/58/97/7C/E53960D1295621EFCB5B13F335_1623567851299.png?output-format=webp"
                        className="w-32 mb-3"
                      />
                    </div>
                    <h2 className="title-font font-regular text-xl text-gray-900">
                      Scalable Solutions Expert
                    </h2>
                    <p>
                      I specialize in building web applications that grow
                      seamlessly with your business.
                    </p>
                  </div>
                </div>

                <div className="p-4 md:w-1/4 sm:w-1/2">
                  <div className="px-4 py-6 transform transition duration-500 hover:scale-110">
                    <div className="flex justify-center">
                      <img
                        src="https://image2.jdomni.in/banner/13062021/3E/57/E8/1D6E23DD7E12571705CAC761E7_1623567977295.png?output-format=webp"
                        className="w-32 mb-3"
                      />
                    </div>
                    <h2 className="title-font font-regular text-xl text-gray-900">
                      Versatile Collaboration
                    </h2>
                    <p>
                      My experience across various company sizes allows me to
                      adapt quickly to different team dynamics and project
                      requirements.
                    </p>
                  </div>
                </div>

                <div className="p-4 md:w-1/4 sm:w-1/2">
                  <div className="px-4 py-6 transform transition duration-500 hover:scale-110">
                    <div className="flex justify-center">
                      <img
                        src="https://image3.jdomni.in/banner/13062021/16/7E/7E/5A9920439E52EF309F27B43EEB_1623568010437.png?output-format=webp"
                        className="w-32 mb-3"
                      />
                    </div>
                    <h2 className="title-font font-regular text-xl text-gray-900">
                      Problem-Solving Mindset
                    </h2>
                    <p>
                      I excel at identifying challenges and implementing
                      effective solutions promptly.
                    </p>
                  </div>
                </div>

                <div className="p-4 md:w-1/4 sm:w-1/2">
                  <div className="px-4 py-6 transform transition duration-500 hover:scale-110">
                    <div className="flex justify-center">
                      <img
                        src="https://image3.jdomni.in/banner/13062021/EB/99/EE/8B46027500E987A5142ECC1CE1_1623567959360.png?output-format=webp"
                        className="w-32 mb-3"
                      />
                    </div>
                    <h2 className="title-font font-regular text-xl text-gray-900">
                      Client-Centric Approach
                    </h2>
                    <p>
                      Your business goals are my top priority; I ensure that the
                      solutions provided align perfectly with your objectives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
          <div className="py-5 flex justify-center">
            <a
              href="/contact"
              className="flex items-center text-indigo-700 border border-indigo-600 py-2 px-6 gap-2 rounded inline-flex items-center"
            >
              <span>Connect With me!</span>
              <svg
                className="w-4 w-6 h-6 ml-2"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>

          {/* <div className="flex flex-wrap items-center sm:-mx-3 justify-between">
            <div className="w-full md:px-3">
              <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-3xl lg:text-5xl xl:text-6xl">
                  <span className="block xl:inline">Hi, I'm Anjo Tadena </span>
                  <span className="block text-indigo-600 xl:inline">
                    Expert.
                  </span>
                </h1>
                <p className="mx-auto text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl">
                  I am a software engineer with a decade of experience
                  specializing in web development to create scalable,
                  high-performing applications. I have partnered with startups,
                  small businesses, medium-sized companies, and enterprises to
                  deliver customized solutions that align with their unique
                  objectives and requirements.
                </p>
                <div className="relative flex flex-col sm:flex-row sm:space-x-4">
                  <a
                    href="#_"
                    className="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-indigo-600 rounded-md sm:mb-0 hover:bg-indigo-700 sm:w-auto"
                  >
                    Connect with me
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>
      <section className="py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-8">Technology Stack</h2>
        <div className="flex justify-center gap-12 overflow-x-auto px-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex-shrink-0 flex justify-center items-center"
            >
              <Image
                src={tool.src}
                alt={tool.name}
                width={64}
                height={64}
                className="w-auto h-auto max-w-[64px] max-h-[64px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
