import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- API URL ---
const apiBaseUrl = 'https://sortify-api-sid.onrender.com'; // Your live API URL

// --- BACKGROUND IMAGE URLS ---
const lightBgUrl = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop';
const darkBgUrl = '/sortify-app/src/lightBg.png';


// --- ICON COMPONENTS ---
const StarIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const SearchIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SunIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const CartIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const TrashIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const Spinner = ({ size = 'h-12 w-12' }) => (<div className="flex justify-center items-center p-8"><div className={`animate-spin rounded-full ${size} border-b-2 border-gray-900 dark:border-gray-100`}></div></div>);
const MenuIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>);


// --- UI COMPONENTS ---

const CartModal = ({ cart, onClose, onRemoveItem }) => {
    const [copyStatus, setCopyStatus] = useState('');
    const handleCopyCart = () => {
        const textToCopy = cart.map(item => item.name).join('\n');
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); setCopyStatus('Copied!'); } catch (err) { setCopyStatus('Failed to copy'); }
        document.body.removeChild(textArea);
        setTimeout(() => setCopyStatus(''), 2000);
    }
    const handleExportCart = () => {
        const content = cart.map(item => `Name: ${item.name}\nPrice: ${item.discount_price}\nLink: ${item.link}\n----------------------------------\n`).join('');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sortify-cart.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    const total = cart.reduce((sum, item) => {
        const price = parseFloat((item.discount_price || '0').replace(/[^0-9.]/g, ''));
        return sum + price;
    }, 0);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"><header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Your Cart ({cart.length})</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CloseIcon className="h-6 w-6 text-gray-600 dark:text-gray-300"/></button></header><div className="overflow-y-auto p-4 flex-grow">{cart.length === 0 ? (<p className="text-center text-gray-500 dark:text-gray-400 py-8">Your cart is empty.</p>) : (<ul className="divide-y divide-gray-200 dark:divide-gray-700">{cart.map(item => (<li key={item._id} className="flex items-center py-4 space-x-4"><img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-md bg-white p-1"/><div className="flex-grow"><a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600">{item.name}</a><p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{item.discount_price}</p></div><button onClick={() => onRemoveItem(item._id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="h-6 w-6 text-red-500"/></button></li>))}</ul>)}</div>{cart.length > 0 && (<footer className="p-4 border-t border-gray-200 dark:border-gray-700"><div className="flex justify-between items-center mb-4"><span className="text-lg font-bold text-gray-800 dark:text-gray-100">Total:</span><span className="text-xl font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span></div><div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"><button onClick={handleCopyCart} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">{copyStatus || 'Copy Cart'}</button><button onClick={handleExportCart} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Export Cart</button></div></footer>)}</div></div>
    )
}

const ProductCard = ({ product, onAddToCart, cart }) => {
  const id = product?._id;
  const title = product?.name || 'No Title Available';
  const price = product?.discount_price || '₹0';
  const rating = parseFloat(product?.ratings) || 0;
  const reviewsText = product?.no_of_ratings || '0';
  const reviews = parseInt(reviewsText.replace(/,/g, '')) || 0;
  const imageUrl = product?.image || 'https://placehold.co/200x200/f8f8f8/ccc?text=Image+N/A';
  const productURL = product?.link || '#';
  
  const isInCart = cart.some(item => item._id === id);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col sm:flex-row items-center sm:items-start text-left space-x-0 sm:space-x-6 p-4 w-full hover:shadow-xl transition-shadow duration-300"><div className="w-48 h-48 flex-shrink-0 mb-4 sm:mb-0 bg-white rounded-md p-2"><img src={imageUrl} alt={title} className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://placehold.co/200x200/f8f8f8/ccc?text=Image+N/A'; }} /></div><div className="flex-grow"><h3 className="text-lg font-medium text-gray-800 dark:text-gray-100"><a href={productURL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">{title}</a></h3><div className="flex items-center mt-2"><span className="text-yellow-500 font-bold">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span><div className="flex ml-2">{[...Array(5)].map((_, i) => (<StarIcon key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />))}</div><span className="text-sm text-gray-500 dark:text-gray-400 ml-3 hover:text-blue-600 cursor-pointer">{reviews.toLocaleString()} ratings</span></div><div className="mt-3"><span className="text-2xl font-bold text-gray-900 dark:text-white">{price}</span></div><div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3"><button onClick={() => onAddToCart(product)} disabled={isInCart} className={`w-full sm:w-auto font-semibold py-2 px-6 rounded-lg transition-colors duration-300 ${isInCart ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'}`}>{isInCart ? 'Added to Cart' : 'Add to Cart'}</button><a href={productURL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300">Buy Now</a></div></div></div>
  )
}

const Avatar = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">{initial}</div>)
}

const Header = ({ user, onLogout, theme, toggleTheme, cart, onCartClick, onResetSearch }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    return (
        <header className="bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-sm text-white shadow-md sticky top-0 z-20 border-b border-gray-700">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Mobile View */}
                <div className="sm:hidden flex justify-between items-center w-full">
                    <div className="relative">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="flex items-center space-x-2">
                           <Avatar name={user?.name} />
                        </button>
                        {isMobileMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                                <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 font-semibold border-b dark:border-gray-600">{user?.name}</div>
                                <button onClick={() => { onCartClick(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Cart ({cart.length})</button>
                                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                            </div>
                        )}
                    </div>
                     <h1 onClick={onResetSearch} className="text-2xl font-bold text-yellow-400 cursor-pointer">Sortify</h1>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                    </button>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:flex justify-between items-center w-full">
                    <div className="w-1/3 flex items-center space-x-3">
                      <Avatar name={user?.name} />
                      <span className="font-semibold">{user?.name}</span>
                    </div>
                    <div className="w-1/3 text-center">
                        <h1 onClick={onResetSearch} className="text-2xl font-bold text-yellow-400 cursor-pointer">Sortify</h1>
                    </div>
                    <nav className="w-1/3 flex items-center justify-end space-x-4">
                        <button onClick={onCartClick} className="relative p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <CartIcon className="h-6 w-6 text-white"/>
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-gray-800">{cart.length}</span>}
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">Logout</button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

const PageWrapper = ({ theme, children }) => {
    return (
        <div className="min-h-screen relative">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
                style={{ backgroundImage: `url(${theme === 'light' ? lightBgUrl : darkBgUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/90 backdrop-blur-sm"></div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

const SearchPage = ({ user, onLogout, theme, toggleTheme, cart, onAddToCart, onRemoveFromCart }) => {
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();

  const lastProductElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchProducts = useCallback(async (pageNum, searchQuery, priceInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${apiBaseUrl}/search`);
      url.searchParams.append('search', searchQuery);
      url.searchParams.append('page', pageNum);
      if (priceInfo.min) url.searchParams.append('minPrice', priceInfo.min);
      if (priceInfo.max) url.searchParams.append('maxPrice', priceInfo.max);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      setResults(prevResults => {
        return pageNum === 1 ? data.products : [...prevResults, ...data.products];
      });
      setHasMore(data.currentPage < data.totalPages);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page > 1 && hasSearched) {
      fetchProducts(page, query, priceRange);
    }
  }, [page, hasSearched, fetchProducts, query, priceRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
        setError("Please enter a search term.");
        return;
    }
    setPage(1);
    setResults([]);
    setHasSearched(true);
    fetchProducts(1, query, priceRange);
  }

  const handleResetSearch = () => {
    setQuery('');
    setPriceRange({ min: '', max: '' });
    setResults([]);
    setHasSearched(false);
    setPage(1);
    setError(null);
  };

  return (
    <PageWrapper theme={theme}>
      {isCartOpen && <CartModal cart={cart} onClose={() => setIsCartOpen(false)} onRemoveItem={onRemoveFromCart} />}
      <Header 
        user={user}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        cart={cart}
        onCartClick={() => setIsCartOpen(true)}
        onResetSearch={handleResetSearch}
      />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Welcome, {user?.name}! Find the Best Products</h2>
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full flex-grow">
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 'gaming laptop' or 'wireless headphones'" className="w-full p-3 pl-4 pr-12 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <label className="text-gray-700 dark:text-gray-200 whitespace-nowrap">Price:</label>
                    <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})} className="w-full p-3 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-gray-500">-</span>
                    <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})} className="w-full p-3 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={isLoading && page === 1} className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-blue-400">
                    <SearchIcon className="h-5 w-5 mr-2" />
                    {isLoading && page === 1 ? 'Searching...' : 'Search'}
                </button>
            </div>
          </form>
        </div>
        <div>
          {error && <div className="text-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4"><p><strong>Error:</strong> {error}</p></div>}
          
          <div className="space-y-4">
            {results.map((product, index) => {
              if (results.length === index + 1) {
                return <div ref={lastProductElementRef} key={product._id}><ProductCard product={product} onAddToCart={onAddToCart} cart={cart} /></div>
              } else {
                return <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} cart={cart} />
              }
            })}
          </div>

          {isLoading && <Spinner />}

          {hasSearched && !isLoading && results.length === 0 && (
            <div className="text-center py-10 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md"><h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No Results Found</h3><p className="text-gray-500 dark:text-gray-400 mt-2">We couldn't find any products matching your search. Try different keywords.</p></div>
          )}
          
          {!hasSearched && (
            <div className="text-center py-10 px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md"><h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Ready to Find the Best?</h3><p className="text-gray-500 dark:text-gray-400 mt-2">Enter a search term and a price range to get started.</p></div>
          )}
        </div>
      </main>
    </PageWrapper>
  )
}

const SetupPage = ({ onSetupComplete, theme, toggleTheme }) => {
    const [username, setUsername] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (username.trim()) { onSetupComplete(username.trim()); } }
    return (
        <PageWrapper theme={theme}>
            <div className="min-h-screen flex items-center justify-center">
                <div className="absolute top-4 right-4"><button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}</button></div><div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl rounded-xl p-8 md:p-12 w-full max-w-md mx-4 transition-colors duration-300"><div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">One Last Step...</h1><p className="text-gray-500 dark:text-gray-400 mt-2">Please enter a username to personalize your experience.</p></div><form onSubmit={handleSubmit} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">Username</label><input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Alex" /></div><div><button type="submit" disabled={!username.trim()} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed">Continue</button></div></form></div>
            </div>
        </PageWrapper>
    )
}

const LoginPage = ({ onLogin, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (!email || !password) return setError('Please enter both email and password.'); setError(''); onLogin(); }
  return (
    <PageWrapper theme={theme}>
        <div className="min-h-screen flex items-center justify-center">
            <div className="absolute top-4 right-4"><button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}</button></div><div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl rounded-xl p-8 md:p-12 w-full max-w-md mx-4 transition-colors duration-300"><div className="text-center mb-8"><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sortify</h1><p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to find the best products</p></div><form onSubmit={handleSubmit} className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email Address</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" /></div>{error && <p className="text-red-500 text-sm">{error}</p>}<div><button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">Sign In</button></div></form><div className="text-center mt-6"><a href="#" className="text-sm text-blue-600 hover:underline">Forgot your password?</a></div></div>
        </div>
    </PageWrapper>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') { document.documentElement.classList.add('dark'); } 
    else { document.documentElement.classList.remove('dark'); }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  const handleAddToCart = (productToAdd) => setCart(prevCart => { if (prevCart.find(item => item._id === productToAdd._id)) { return prevCart; } return [...prevCart, productToAdd]; });
  const handleRemoveFromCart = (productIdToRemove) => setCart(prevCart => prevCart.filter(item => item._id !== productIdToRemove));
  const handleLogin = () => setIsLoggedIn(true);
  const handleSetupComplete = (username) => setUser({ name: username });
  const handleLogout = () => { setIsLoggedIn(false); setUser(null); setCart([]); };
  
  if (!isLoggedIn) { return <LoginPage onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />; }
  if (!user) { return <SetupPage onSetupComplete={handleSetupComplete} theme={theme} toggleTheme={toggleTheme} />; }
  return <SearchPage user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} cart={cart} onAddToCart={handleAddToCart} onRemoveFromCart={handleRemoveFromCart} />;
}

