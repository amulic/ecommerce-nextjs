'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { useQueryState } from "nuqs";
import { Category } from "@prisma/client";

interface SearchProps  {
    categories: Category[];  
}

export function Search(props: SearchProps) {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
        defaultValue: "",
        shallow:false
    });
    const [, setCategorySlug] = useQueryState("category", {
        defaultValue: "",
        shallow:false
    });

    const handleSearchChange = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
	  }, 500); // 500ms debounce delay

	const handleCategoryChange = (value: string) => {
		setCategorySlug(value);
	};


    return (
        	
			<div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2 w-full md:w-1/3">
                <Label htmlFor="search">Search Products</Label>
                <Input
                    id="search"
                    placeholder="Search by product name..."
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="flex flex-col space-y-2 w-full md:w-1/4">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                      {
                            props.categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full md:w-auto">
                
                <Button className="w-full" variant="outline" onClick={()=>{
                    setSearchQuery("");
                    setCategorySlug("");
                }}>
                    Clear Filters
                </Button>
            </div>
        </div>
    );
  

}