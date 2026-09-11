import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recruiterAPI } from "../services/api";
import { Briefcase, Phone, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import { useToast } from "../components/Toast";
import ProfileCompletion from "../components/ProfileCompletion";

export default function RecruiterProfile() {
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);

  // Create Company form states
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadProfileAndCompanies = async () => {
    try {
      const comps = await recruiterAPI.getCompanies();
      setCompanies(comps);

      const profile = await recruiterAPI.getProfile();
      if (profile) {
        setDesignation(profile.designation || "");
        setPhone(profile.phone || "");
        setCompanyId(profile.company_id || "");
        setHasProfile(true);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
        showToast("Failed to load profile details.", "error");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadProfileAndCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCompanyId = companyId;

      if (isCreatingCompany) {
        if (!companyName) {
          showToast("Company Name is required.", "error");
          setLoading(false);
          return;
        }

        const newCompany = await recruiterAPI.createCompany({
          name: companyName,
          website: companyWebsite || null,
          industry: companyIndustry || null,
          location: companyLocation || null,
          description: companyDesc || null,
        });
        finalCompanyId = newCompany.id;
      }

      if (!finalCompanyId) {
        showToast("Please select a company or create a new one.", "error");
        setLoading(false);
        return;
      }

      if (hasProfile) {
        await recruiterAPI.updateProfile(parseInt(finalCompanyId), designation, phone);
      } else {
        await recruiterAPI.createProfile(parseInt(finalCompanyId), designation, phone);
        setHasProfile(true);
      }

      showToast("Profile updated successfully!", "success");
      setTimeout(() => {
        navigate("/recruiter/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to save profile. Please verify your entries.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 border-r-2" />
        <span className="ml-3 font-medium">Assembling recruiter details...</span>
      </div>
    );
  }

  const completionSections = [
    { label: "Company", completed: !!companyId || (isCreatingCompany && !!companyName) },
    { label: "Designation", completed: !!designation },
    { label: "Phone", completed: !!phone },
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <ProfileCompletion sections={completionSections} />
        </div>

        <div className="bg-[#0f172a]/60 border border-gray-800/80 rounded-3xl p-8 backdrop-blur-md shadow-xl">
          <div className="mb-8 pb-6 border-b border-gray-800/80">
            <h2 className="text-2xl font-extrabold text-white">Company & Recruiting Profile</h2>
            <p className="text-gray-400 text-sm mt-1">
              Select or register your company to post job openings and filter matching developer applications.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Job Title / Designation
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Technical Recruiter"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 092-1245"
                    className="w-full bg-[#070b13]/80 border border-gray-800 hover:border-gray-700 focus:border-emerald-500/50 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-800/80 rounded-2xl p-6 bg-[#070b13]/40">
              <div className="flex justify-between items-center mb-4">
                <span className="block text-white text-sm font-bold">Company Association</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isCreatingCompany ? "Choose Existing Company" : "Create New Company"}
                </button>
              </div>

              {isCreatingCompany ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="TechCorp Solutions"
                      className="w-full bg-[#070b13]/85 border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Website URL</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://techcorp.com"
                        className="w-full bg-[#070b13]/85 border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1.5">Industry Type</label>
                      <input
                        type="text"
                        value={companyIndustry}
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                        placeholder="Software Engineering / SaaS"
                        className="w-full bg-[#070b13]/85 border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Office Location</label>
                    <input
                      type="text"
                      value={companyLocation}
                      onChange={(e) => setCompanyLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full bg-[#070b13]/85 border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5">Company Description</label>
                    <textarea
                      value={companyDesc}
                      onChange={(e) => setCompanyDesc(e.target.value)}
                      placeholder="A fast-growing developer tools and cloud intelligence enterprise."
                      rows={3}
                      className="w-full bg-[#070b13]/85 border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-400 text-xs mb-2">Select Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full bg-[#070b13] border border-gray-800 focus:border-emerald-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Corporate Profile --</option>
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name} ({comp.location || "Remote"})
                      </option>
                    ))}
                  </select>
                  {companies.length === 0 && (
                    <p className="text-gray-500 text-xs mt-2">
                      No companies exist yet. Click "Create New Company" above to register your brand.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-800/80">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-800 disabled:to-teal-800 text-black font-bold px-8 py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? "Saving details..." : "Save Profile Details"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/recruiter/dashboard")}
                className="bg-gray-850 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-6 py-3.5 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
