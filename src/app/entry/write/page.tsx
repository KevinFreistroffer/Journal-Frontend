"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEntry } from "@/hooks/useEntry";
import { IEntry, ICategory } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  List,
  Grid,
  PlusIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { localStorageService } from "@/lib/services/localStorageService";

import { Spinner } from "@/components/ui/spinner"; // Import a spinner component if you have one
import Link from "next/link";
import { IFrontEndEntry } from "@/app/dashboard/UserDashboard";

function WritePage() {
  const { user, isLoading, setUser } = useAuth();
  const { setSelectedEntry } = useEntry();
  const [entries, setEntrys] = useState<IEntry[]>([]);
  //   const [filteredEntrys, setFilteredEntrys] = useState<IFrontEndEntry[]>(
  //     []
  //   );
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [entry, setEntry] = useState("");
  const [favorite, setFavorite] = useState<boolean>(false); // State for favorite checkbox

  const [isSaving, setIsSaving] = useState(false);
  const [showEntrySuccessIcon, setShowEntrySuccessIcon] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false); // State for dialog
  const [isCreatingCategoryLoading, setIsCreatingCategoryLoading] =
    useState(false); // State for loading indicator
  const [showCreatedCategorySuccessIcon, setShowCreatedCategorySuccessIcon] =
    useState(false); // State for success icon
  const [categoryCreatedErrorMessage, setCategoryCreatedErrorMessage] =
    useState(""); // State for error message
  const [isCategoryCreated, setIsCategoryCreated] = useState(false); // State to track if category is created
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false); // New state for text visibility
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showCategorySuccessIcon, setShowCategorySuccessIcon] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        setIsTextVisible(true); // Show text after animation
      }, 200); // Match this duration with your CSS transition duration

      return () => clearTimeout(timer);
    } else {
      setIsTextVisible(false); // Hide text when sidebar is closed
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const savedEntry = localStorageService.getItem<IEntry>("selectedEntry");
    if (savedEntry) {
      setSelectedEntry(savedEntry);
    }
  }, [setSelectedEntry]);

  useEffect(() => {
    if (user && user.entries) {
      //   const formattedEntrys = user.entries.map((entrie, index) => ({
      //     id: entrie._id,
      //     title: entrie.title,
      //     entry: entrie.entry,
      //     category: entrie.category || "My Entries",
      //     date: entrie.date,
      //     selected: entrie.selected,
      //   }));

      //

      setEntrys(user.entries);
      setCategories(user.entryCategories);
      //   setFilteredEntrys(formattedEntrys);

      const savedEntry = localStorageService.getItem<IEntry>("selectedEntry");
      if (savedEntry) {
        const updatedEntry = user.entries.find((j) => j._id === savedEntry._id);
        if (updatedEntry) {
          setSelectedEntry(updatedEntry);
          localStorageService.setItem("selectedEntry", updatedEntry);
        }
      }

      //   const uniqueCategories = Array.from(
      //     new Set(user.entries.map((j) => j.category))
      //   );

      //   //   if (uniqueCategories.length === 0) {
      //   //     uniqueCategories.push({
      //   //       _id: "1",
      //   //       category: "My Entries",
      //   //       selected: false,
      //   //     });
      //   //   }

      setSelectedCategory("");
    }
  }, [user, setSelectedEntry]);

  useEffect(() => {
    if (user && !user.isVerified) {
      setIsVerifiedModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (newCategoryName.trim() !== "" && isCategoryCreated) {
      setIsCategoryCreated(false);
    }
  }, [newCategoryName, isCategoryCreated]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newEntry = {
      title,
      entry,
      category:
        categories.length === 0 || selectedCategory.trim() === ""
          ? "Uncategorized"
          : selectedCategory,
      userId: user?._id,
      favorite,
    };

    try {
      const response = await fetch(`/api/user/entry/create`, {
        method: "POST",
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        throw new Error("Failed to create entrie");
      }

      if (response.status === 200) {
        const body = await response.json();

        const userData = body.data;

        setUser(userData);
        setEntrys(userData.entries);
        // setFilteredEntrys(userData.entries);
        if (userData.entryCategories && userData.entryCategories.length > 0) {
          setCategories(userData.entryCategories);
        }
        setTitle("");
        setEntry("");
        setFavorite(false); // Reset favorite checkbox
        setShowEntrySuccessIcon(true);
        setTimeout(() => setShowEntrySuccessIcon(false), 3000);
      }
    } catch (error) {
      console.error("Error creating entrie:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCreatedCategorySuccessIcon(false); // Hide success icon
    setIsCreateCategoryDialogOpen(false); // Close dialog immediately
    setIsCategoryCreated(false); // Reset category created state
    setNewCategoryName("");
    setCategoryCreatedErrorMessage("");
    setIsCreatingCategoryLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Clear the timeout if the dialog is closed
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear timeout on component unmount
      }
    };
  }, []);
  // const { openModal } = useContext(ModalContext);

  // const handleOpenModal = () => {
  //   openModal(<div>Your custom content here!</div>);
  // };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // Check if category already exists
      if (
        categories.some(
          (cat) =>
            cat.category.toLowerCase() === newCategoryName.trim().toLowerCase()
        )
      ) {
        setCategoryCreatedErrorMessage("Category already exists.");
        return;
      }

      // Add new category to the list
      setCategories([...categories, { category: newCategoryName.trim() }]);
      setSelectedCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsAddingCategory(false);
      setCategoryCreatedErrorMessage("");

      // Show success icon and hide it after 3 seconds
      setShowCategorySuccessIcon(true);

      // setTimeout(() => setShowCategorySuccessIcon(false), 3000);
    }
  };

  // Check if the user is verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner /> {/* Show a loading spinner while loading */}
      </div>
    );
  }

  if (user && !user.isVerified) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Account Not Verified</h1>
          <p className="mb-4">
            Please verify your account to access the dashboard.
          </p>
          <Button
            onClick={() => {
              /* Add logic to resend verification email or redirect */
            }}
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - hidden on small screens, visible from medium screens and up */}
      <div
        className={`hidden md:flex flex-col bg-gray-100 p-4 overflow-y-auto transition-all duration-300 ease-in-out relative ${
          isSidebarOpen ? "md:w-64" : "md:w-16"
        }`}
      >
        <Button
          className={`relative w-full p-0 mb-6 ${
            isSidebarOpen ? "justify-end" : "justify-center"
          }`}
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
        <div className="flex flex-col items-center">
          <Link
            href="/entries"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <List />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Entries ({entries.length})</span>
            )}
          </Link>
          <Link
            href="/categories"
            className={`w-full flex items-center h-6 mt-4 mb-4 mr-0 ${
              isSidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <Grid />
            {isSidebarOpen && isTextVisible && (
              <span className="ml-2">Categories ({categories.length})</span>
            )}
          </Link>
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full p-6 overflow-y-auto max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Entrie Dashboard</h1>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create New Entry</h2>
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="entry">Entry</Label>
              <Textarea
                id="entry"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Select
                    onValueChange={setSelectedCategory}
                    value={selectedCategory}
                    className="w-2/3"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.length > 0 ? (
                        categories.map((cat, index) => (
                          <SelectItem key={index} value={cat.category}>
                            {cat.category}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="disabled" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="w-1/3"
                  >
                    {isAddingCategory ? (
                      <>
                        <X size={20} className="mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <PlusIcon className="mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
                {isAddingCategory && (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category"
                      className="w-2/3"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCategory}
                      className="w-1/3"
                    >
                      Add
                    </Button>
                  </div>
                )}
                {showCategorySuccessIcon && (
                  <div className="flex items-center">
                    <Check size={20} className="text-green-500 mr-2" />
                    <span className="text-green-500">Category added successfully!</span>
                  </div>
                )}
              </div>
              {categoryCreatedErrorMessage && (
                <p className="text-red-500 mt-1">
                  {categoryCreatedErrorMessage}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <Label htmlFor="favorite" className="mr-2">
                Favorite
              </Label>
              <input
                type="checkbox"
                id="favorite"
                checked={favorite}
                onChange={(e) => {
                  console.log(e.target.checked, typeof e.target.checked);
                  setFavorite(e.target.checked);
                }}
              />
            </div>
            <div className="flex items-center">
              <Button
                type="submit"
                disabled={isSaving || !title || !entry}
                className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
              >
                {isSaving ? "Saving..." : "Create Entrie"}
              </Button>
              {showEntrySuccessIcon && (
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 animate-fade-in-out" />
                  <p className="text-green-500">Entrie created successfully!</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          padding: "1rem",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <h1>{isCategoryCreated.toString()}</h1>
      </div>
    </div>
  );
}

export default WritePage;