import ReactDOM from "react-dom";

const FollowupModal = ({ onClose, onSubmit, formState, setFormState }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">➕ New Follow-up</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={formState.message}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, message: e.target.value }))
            }
            placeholder="Enter follow-up message"
            className="w-full border rounded p-2"
            required
          />
          <input
            type="date"
            value={formState.nextFollowupDate}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                nextFollowupDate: e.target.value,
              }))
            }
            className="w-full border rounded p-2"
            required
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✅ Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FollowupModal;
