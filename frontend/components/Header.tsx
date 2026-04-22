import { Button } from "@/components/ui/button"

export default function Header({ addFile }: { addFile: () => void }) {
    return (
        <div className="h-16  flex items-center justify-between rounded-t-xl px-4">
            <h1 className="text-lg text-black sm:text-2xl font-semibold tracking-tight">
                Space<span className="text-indigo-600">Cloud</span>
            </h1>
            <Button variant="outline" size="lg" onClick={addFile}>Upload</Button>
        </div>
    )
}