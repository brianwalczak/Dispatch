import { api_url } from "../providers/config";
// ------------------------------------------------------- //
import { useDashboard } from "../providers/DashboardContext";
import { useState, useEffect, useCallback } from "react";

function CreateWorkspace({ onLoad }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState("");
    const { token } = useDashboard();

    useEffect(() => {
        setLoading(false);
        if (onLoad) onLoad();
    }, [onLoad]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        let name = $('#name').val();
        let description = $('#description').val();
        if (name) name = name.trim();
        if (description) description = description.trim();

        // Name validation
        if (!name) {
            return setStatus("Please provide a name for your workspace.");
        } else if (name.length < 5 || name.length > 100) {
            return setStatus("Your workspace name must be between 5 and 100 characters long.");
        }

        // Description validation
        if (!description) {
            return setStatus("Please provide a description for your workspace.");
        } else if (description.length < 5 || description.length > 256) {
            return setStatus("Your workspace description must be between 5 and 256 characters long.");
        }

        setSubmitting(true);

        const [response] = await Promise.allSettled([
            $.ajax({
                url: $(e.target).attr('action'),
                method: $(e.target).attr('method'),
                data: ($(e.target).serialize() + `&token=${encodeURIComponent(token)}`) // add token to form data
            }),
            new Promise(r => setTimeout(r, 1500)) // minimum 1.5s wait
        ]);

        if (response.status === "fulfilled") {
            localStorage.setItem('workspace', response.value.data.id);
            window.location.href = '/';
        } else {
            setStatus(response.reason.responseJSON?.error || response.reason.statusText);
        }
    }, [token]);

    if (loading) return null;
    return (
        <div className="flex flex-col w-full h-full justify-center items-center bg-white border border-gray-300 rounded-2xl py-4">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Create a Workspace</h2>
            <p className="text-gray-500 text-xl mb-6">Set up a new workspace for your company or team.</p>

            <form action={`${api_url}/api/workspaces/new`} method="POST" onChange={() => setStatus(null)} onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Workspace name</label>
                    <input type="text" name="name" id="name" className="block w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400" disabled={submitting} placeholder="Enter a name for your workspace (e.g., Acme Inc.)" required />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" id="description" className="block w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400" disabled={submitting} placeholder="What does your company/team do?" rows={4} required />
                </div>

                <div>
                    <button type="submit" className={`flex w-full justify-center rounded-lg bg-red-600 py-2 font-semibold text-white cursor-pointer transition hover:bg-red-700 ${submitting ? "opacity-60 cursor-not-allowed" : ""}`} disabled={submitting} >
                        {submitting ? "Give us a moment..." : "Create Workspace"}
                    </button>
                </div>
            </form>

            {status && <div className={`mt-2 text-lg text-red-600 text-center mt-4`}>{status}</div>}
        </div>
    );
}

export default CreateWorkspace;