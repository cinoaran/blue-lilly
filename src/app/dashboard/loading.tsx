import Spinner from "@/components/shared/Loader/Spinner";

const LoadingPage = () => {
  return (
    <div className="flex-center h-screen w-full gradient">
      <Spinner label="Please wait ..." />
    </div>
  );
};

export default LoadingPage;
