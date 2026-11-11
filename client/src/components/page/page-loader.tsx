import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";

export default function PageLoader(){
    return(
        <div className="flex justify-center items-center dark bg-background w-screen h-screen text-primary">
            <Button variant={"outline"} disabled size={"lg"}>
                <Spinner></Spinner>
                loading...
            </Button>
        </div>
    )
}