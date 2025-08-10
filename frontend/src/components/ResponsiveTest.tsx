import React from 'react';

const ResponsiveTest: React.FC = () => {
  return (
    <div className="container-responsive padding-responsive">
      <div className="space-responsive">
        <h1 className="heading-responsive font-bold text-center">Responsive Design Test</h1>
        <p className="text-responsive text-center text-gray-600">
          This component tests responsive design across all screen sizes
        </p>
        
        {/* Responsive Grid Test */}
        <div className="grid-responsive gap-responsive">
          <div className="card-responsive bg-white rounded-responsive shadow-responsive">
            <h3 className="text-lg-responsive font-semibold mb-2">Mobile (320px+)</h3>
            <p className="text-sm-responsive text-gray-600">Single column layout</p>
          </div>
          <div className="card-responsive bg-white rounded-responsive shadow-responsive">
            <h3 className="text-lg-responsive font-semibold mb-2">Tablet (768px+)</h3>
            <p className="text-sm-responsive text-gray-600">Two column layout</p>
          </div>
          <div className="card-responsive bg-white rounded-responsive shadow-responsive">
            <h3 className="text-lg-responsive font-semibold mb-2">Desktop (1024px+)</h3>
            <p className="text-sm-responsive text-gray-600">Three column layout</p>
          </div>
          <div className="card-responsive bg-white rounded-responsive shadow-responsive">
            <h3 className="text-lg-responsive font-semibold mb-2">Large Desktop (1280px+)</h3>
            <p className="text-sm-responsive text-gray-600">Four column layout</p>
          </div>
        </div>

        {/* Responsive Flex Test */}
        <div className="flex-responsive gap-responsive items-center justify-center">
          <div className="btn-responsive bg-blue-500 text-white rounded-responsive">
            Mobile Stacked
          </div>
          <div className="btn-responsive bg-green-500 text-white rounded-responsive">
            Desktop Side-by-side
          </div>
        </div>

        {/* Responsive Text Test */}
        <div className="space-responsive">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Responsive Typography</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            This text scales appropriately across different screen sizes
          </p>
        </div>

        {/* Responsive Image Test */}
        <div className="image-container-responsive mx-auto rounded-responsive overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=400&q=80" 
            alt="Responsive test image"
            className="img-responsive"
          />
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest; 