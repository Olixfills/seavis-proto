import { useState } from "react";
import { Layout } from "../components/Layout";
import { Section } from "../components/ui";
import { QRCodeCanvas } from "qrcode.react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import type { Candidate } from "../lib/types";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const candidateId = `NNBTS${formData.get("batch")}-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 10000,
      )
        .toString()
        .padStart(4, "0")}`;

      let photoUrl = "";
      if (photoFile) {
        const storageRef = ref(storage, `candidates/${candidateId}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const candidateData: Omit<Candidate, "id"> = {
        candidateId,
        fullName: formData.get("fullName") as string,
        dob: formData.get("dob") as string,
        gender: formData.get("gender") as string,
        state: formData.get("state") as string,
        lga: formData.get("lga") as string,
        nin: formData.get("nin") as string,
        chestNumber: formData.get("chestNumber") as string,
        batch: formData.get("batch") as string,
        centre: formData.get("centre") as string,
        currentPhase: "Online Registration",
        photoUrl,
        stages: {
          registration: "pass",
          aptitude: "pending",
          medical: "pending",
          run: "pending",
          certificate: "pending",
          interview: "pending",
        },
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, "candidates"), {
        ...candidateData,
        createdAt: serverTimestamp(),
      });

      setSuccessId(docRef.id);
    } catch (err) {
      console.error(err);
      alert("Failed to register candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    const verifyUrl = `${window.location.origin}/verify/${successId}`;
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <ShieldCheck className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">
            Registration Successful
          </h2>
          <p className="text-slate-600 mb-8">
            Candidate has been added to the system.
          </p>

          <div className="bg-white p-6 border border-slate-300 rounded shadow-sm inline-block mb-8">
            <QRCodeCanvas value={verifyUrl} size={200} level="H" />
            <p className="text-xs text-slate-500 mt-4 break-all">{verifyUrl}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-navy text-white rounded hover:bg-navy-light"
            >
              Print QR Code
            </button>
            <button
              onClick={() => {
                setSuccessId(null);
                setPhotoFile(null);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300"
            >
              Register Another
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-navy font-bold flex items-center gap-2">
          <UserPlus size={24} /> Register New Candidate
        </h2>
        <Link to="/dashboard" className="text-sm text-navy hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Candidate Identification">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="military-label">Passport Photograph</label>
              <div className="border-2 border-dashed border-slate-300 p-4 text-center rounded bg-slate-50">
                {photoFile ? (
                  <img
                    src={URL.createObjectURL(photoFile)}
                    className="mx-auto h-40 object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400">
                    No image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="mt-4 text-sm w-full"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="military-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="military-input"
                    placeholder="Surname First Name"
                  />
                </div>
                <div>
                  <label className="military-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    className="military-input"
                  />
                </div>
                <div>
                  <label className="military-label">Gender</label>
                  <select name="gender" required className="military-input">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="military-label">NIN</label>
                  <input
                    type="text"
                    name="nin"
                    required
                    className="military-input"
                    pattern="\d{11}"
                    title="11 digit NIN"
                  />
                </div>
                <div>
                  <label className="military-label">State of Origin</label>
                  <input
                    type="text"
                    name="state"
                    required
                    className="military-input"
                  />
                </div>
                <div>
                  <label className="military-label">LGA</label>
                  <input
                    type="text"
                    name="lga"
                    required
                    className="military-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Recruitment Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="military-label">Batch</label>
              <input
                type="number"
                name="batch"
                defaultValue={36}
                required
                className="military-input"
              />
            </div>
            <div>
              <label className="military-label">Screening Centre</label>
              <input
                type="text"
                name="centre"
                required
                className="military-input"
                placeholder="e.g. NNRTC, Ekeremor"
              />
            </div>
            <div>
              <label className="military-label">Chest Number</label>
              <input
                type="text"
                name="chestNumber"
                required
                className="military-input"
                placeholder="e.g. 36/2024/125"
              />
            </div>
          </div>
        </Section>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 bg-navy text-white font-semibold rounded shadow hover:bg-navy-light disabled:opacity-50"
          >
            {loading ? "Saving..." : "Register & Generate QR"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
