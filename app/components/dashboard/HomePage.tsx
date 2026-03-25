export const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to Connectify!</h1>
            <p className="text-lg text-gray-700 mb-8">Your social media dashboard</p>
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">View Profile</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Create Post</button>
                <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Explore</button>
            </div>
        </div>
    );
}