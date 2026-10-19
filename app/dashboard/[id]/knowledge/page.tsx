"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  Upload,
  FileText,
  Globe,
  Trash2,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface KnowledgeFile {
  fileName: string;
  uploadedAt: string;
  chunks: number;
}

export default function KnowledgePage() {
  const params = useParams();

  const websiteId =
    params.id as string;

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [files, setFiles] =
    useState<KnowledgeFile[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [deletingFile, setDeletingFile] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD FILES
  // ==========================================

  async function loadFiles() {
    try {
      const res = await fetch(
        `/api/knowledge/${websiteId}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to load knowledge files."
        );
      }

      setFiles(
        data.files || []
      );
    } catch (error: any) {
      setError(
        error?.message ||
          "Failed to load knowledge files."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (websiteId) {
      loadFiles();
    }
  }, [websiteId]);

  // ==========================================
  // UPLOAD FILE
  // ==========================================

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const form =
        new FormData();

      form.append(
        "file",
        file
      );

      form.append(
        "websiteId",
        websiteId
      );

      const res =
        await fetch(
          "/api/knowledge/upload",
          {
            method: "POST",
            body: form,
          }
        );

      const data =
        await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Upload failed."
        );
      }

      setMessage(
        `${data.fileName} uploaded successfully with ${data.chunks} knowledge chunks.`
      );

      await loadFiles();
    } catch (error: any) {
      setError(
        error?.message ||
          "Upload failed."
      );
    } finally {
      setUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  // ==========================================
  // DELETE FILE
  // ==========================================

  async function deleteFile(
    fileName: string
  ) {
    const ok = confirm(
      `Delete "${fileName}" from this bot's knowledge base?`
    );

    if (!ok) {
      return;
    }

    setDeletingFile(fileName);
    setMessage("");
    setError("");

    try {
      const res =
        await fetch(
          "/api/knowledge/delete",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              websiteId,
              fileName,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Delete failed."
        );
      }

      setMessage(
        `${fileName} deleted successfully.`
      );

      await loadFiles();
    } catch (error: any) {
      setError(
        error?.message ||
          "Delete failed."
      );
    } finally {
      setDeletingFile(null);
    }
  }

  const totalChunks =
    files.reduce(
      (total, file) =>
        total + file.chunks,
      0
    );

  const uploadedDocuments =
    files.filter(
      (file) =>
        file.fileName !==
        "__website__"
    ).length;

  return (
    <main className="min-h-screen p-6 md:p-10">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          AI Knowledge
        </p>

        <h1 className="mt-2 text-4xl font-bold text-zinc-900">
          Knowledge Base
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-500">
          Add information your AI assistant can use
          when answering visitor questions.
        </p>
      </div>

      {/* STATS */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <StatCard
          icon={
            <Database size={21} />
          }
          label="Knowledge Sources"
          value={files.length}
        />

        <StatCard
          icon={
            <FileText size={21} />
          }
          label="Uploaded Documents"
          value={uploadedDocuments}
        />

        <StatCard
          icon={
            <Database size={21} />
          }
          label="Total Chunks"
          value={totalChunks}
        />

      </div>

      {/* UPLOAD CARD */}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Add Knowledge
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Upload TXT or DOCX documents.
              Maximum file size: 5 MB.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={uploadFile}
              disabled={uploading}
              className="hidden"
              id="knowledge-file"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Processing...
                </>
              ) : (
                <>
                  <Upload size={18} />

                  Upload Document
                </>
              )}
            </button>
          </div>

        </div>

        {message && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {message}
            </span>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>
          </div>
        )}

      </div>

      {/* SOURCES */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-xl font-bold text-zinc-900">
            Knowledge Sources
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Content available to your AI assistant.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-zinc-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading knowledge...
          </div>
        ) : files.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Database
              size={36}
              className="mx-auto text-zinc-300"
            />

            <h3 className="mt-4 font-semibold text-zinc-800">
              No knowledge sources found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Upload a document to add information
              to this bot.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">

                  <th className="px-6 py-4">
                    Source
                  </th>

                  <th className="px-6 py-4 text-center">
                    Chunks
                  </th>

                  <th className="px-6 py-4">
                    Added
                  </th>

                  <th className="px-6 py-4 text-right">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">

                {files.map((file) => {
                  const isWebsite =
                    file.fileName ===
                    "__website__";

                  return (
                    <tr
                      key={file.fileName}
                      className="transition hover:bg-zinc-50"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              isWebsite
                                ? "bg-blue-50 text-blue-600"
                                : "bg-violet-50 text-violet-600"
                            }`}
                          >
                            {isWebsite ? (
                              <Globe size={20} />
                            ) : (
                              <FileText size={20} />
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-zinc-900">
                              {isWebsite
                                ? "Website Crawl"
                                : file.fileName}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {isWebsite
                                ? "Original website knowledge"
                                : "Uploaded document"}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5 text-center">

                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                          {file.chunks}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-500">

                        {file.uploadedAt
                          ? new Date(
                              file.uploadedAt
                            ).toLocaleString()
                          : "—"}

                      </td>

                      <td className="px-6 py-5 text-right">

                        {isWebsite ? (
                          <span className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              deletingFile ===
                              file.fileName
                            }
                            onClick={() =>
                              deleteFile(
                                file.fileName
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingFile ===
                            file.fileName ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}

                            Delete
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <p className="text-sm text-zinc-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}