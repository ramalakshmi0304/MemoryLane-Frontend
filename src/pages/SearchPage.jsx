import React, { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import MemoryCard from "../components/MemoryCard";
import { Input } from "@/components/ui/input";
import API from "../api/axios";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagFilter, setTagFilter] = useState(""); 
  const [loading, setLoading] = useState(true);

  // 1. Fetch Tags once on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagRes = await API.get("/memories/tags");
        const rawTags = tagRes.data?.data || tagRes.data || [];
        setTags(Array.isArray(rawTags) ? rawTags : []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  // 2. Fetch Memories whenever tagFilter changes
  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        let endpoint = "/memories";

        // IMPORTANT: We use the tag NAME now because your backend join 
        // logic looks for memory_tags.tags.name
        if (tagFilter && tagFilter !== "") {
          endpoint = `/memories/tag/${tagFilter}`;
        }

        const res = await API.get(endpoint);

        // GET DATA FROM RESPONSE
        const rawFetchedData = res.data?.memories || res.data?.data || res.data || [];
        
        // --- FIX: FLATTEN THE DATA ---
        // Since the 'tags' column is gone, we extract names from the memory_tags join
        const flattenedData = Array.isArray(rawFetchedData) 
          ? rawFetchedData.map(m => ({
              ...m,
              tags: m.memory_tags?.map(mt => mt.tags?.name).filter(Boolean) || []
            }))
          : [];

        setMemories(flattenedData);
      } catch (err) {
        console.error("Fetch memories error:", err);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [tagFilter]); 

  // 3. Client-side search (Filters the flattened results)
  const filteredResults = useMemo(() => {
    if (!Array.isArray(memories)) return [];
    if (!query) return memories;

    const searchTerm = query.toLowerCase();
    return memories.filter((m) => {
      return (
        (m.title || "").toLowerCase().includes(searchTerm) ||
        (m.description || "").toLowerCase().includes(searchTerm) ||
        (m.location || "").toLowerCase().includes(searchTerm)
      );
    });
  }, [query, memories]);

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold font-serif italic text-[#3d2b1f]">Search Vault</h1>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or location..."
              className="pl-10 h-12 rounded-xl border-orange-100 bg-white/50 focus:ring-[#c87a3f]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 text-sm px-4 h-12 rounded-xl outline-none cursor-pointer min-w-[180px] hover:border-[#c87a3f] transition-colors"
          >
            <option value="">All Categories</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}> 
                {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-[#c87a3f] mb-4" />
              <p className="text-slate-400 italic">Searching the archives...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  album={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 border border-dashed border-orange-200 rounded-[2rem]">
              <p className="text-[#3d2b1f] font-serif italic text-lg">
                No memories found.
              </p>
              <button
                onClick={() => { setQuery(""); setTagFilter(""); }}
                className="mt-4 text-[#c87a3f] text-sm font-bold uppercase tracking-widest hover:underline"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}