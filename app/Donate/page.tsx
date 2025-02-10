// app/Donate/page.tsx
export default function DonatePage() {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Donate to Support Healthcare
        </h1>
        <p className="mb-8 text-center text-lg">
          We believe healthcare is a right for all. Please consider donating to one
          of these organizations that work tirelessly to improve and expand access to
          quality healthcare.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card for Healthcare for All */}
          <div className="border rounded p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">Healthcare for All</h2>
            <p className="mb-4">
              Healthcare for All is dedicated to ensuring every individual has access to
              quality healthcare. Their advocacy helps expand services and lower costs,
              making healthcare more accessible and affordable.
            </p>
            <a
              href="https://hcfama.org/donate/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Donate Now
            </a>
          </div>
  
          {/* Card for Families USA */}
          <div className="border rounded p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">Families USA</h2>
            <p className="mb-4">
              Families USA works to strengthen the healthcare system for all Americans.
              Through advocacy, education, and community engagement, they promote
              policies that ensure healthcare remains a universal right.
            </p>
            <a
              href="https://familiesusa.org/donate/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Donate Now
            </a>
          </div>
  
          {/* Card for National Patient Advocate Foundation */}
          <div className="border rounded p-6 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">National Patient Advocate Foundation</h2>
            <p className="mb-4">
              The National Patient Advocate Foundation champions the rights of patients
              by offering advocacy, education, and policy guidance to ensure fair and
              equitable treatment within the healthcare system.
            </p>
            <a
              href="https://www.npaf.org/actions/donate/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Donate Now
            </a>
          </div>
        </div>
      </main>
    );
  }
  