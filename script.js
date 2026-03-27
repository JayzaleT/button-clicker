// Supabase configuration - REPLACE WITH YOUR VALUES!
const SUPABASE_URL = 'https://qpbnivtoewrcjjafauoi.supabase.co';  // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwYm5pdnRvZXdyY2pqYWZhdW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjAzNDIsImV4cCI6MjA5MDE5NjM0Mn0.gxpSV9SrvV_QQA5fIAhU_voAxoSUcsutscCgFV4AaqY';  // Your anon public key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get or create user ID
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('userId', userId);
}

let yourScore = 0;

// Show/hide loading indicator
function setLoading(loading) {
    document.getElementById('loading').style.display = loading ? 'block' : 'none';
}

// Load all stats from database
async function loadStats() {
    setLoading(true);
    try {
        // Get user's score
        const { data: userClicks, error: userError } = await supabase
            .from('clicks')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);
        
        if (userError) throw userError;
        yourScore = userClicks?.length || 0;
        document.getElementById('yourScore').textContent = yourScore;
        
        // Get global stats
        const { data: globalStats, error: globalError } = await supabase
            .rpc('get_global_stats');
        
        if (globalError) throw globalError;
        
        if (globalStats && globalStats[0]) {
            document.getElementById('globalRed').textContent = globalStats[0].red_count || 0;
            document.getElementById('globalBlue').textContent = globalStats[0].blue_count || 0;
            document.getElementById('globalTotal').textContent = globalStats[0].total_count || 0;
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
        alert('Error loading data. Please refresh the page.');
    } finally {
        setLoading(false);
    }
}

// Add a click
async function addClick(color) {
    setLoading(true);
    try {
        // Insert the click
        const { error: insertError } = await supabase
            .from('clicks')
            .insert([
                { user_id: userId, color: color }
            ]);
        
        if (insertError) throw insertError;
        
        // Refresh all stats
        await loadStats();
        
    } catch (error) {
        console.error('Error adding click:', error);
        alert('Error saving your click. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Reset user's score
async function resetScore() {
    if (!confirm('Are you sure you want to reset your score? This cannot be undone!')) {
        return;
    }
    
    setLoading(true);
    try {
        // Delete user's clicks
        const { error: deleteError } = await supabase
            .from('clicks')
            .delete()
            .eq('user_id', userId);
        
        if (deleteError) throw deleteError;
        
        // Refresh stats
        await loadStats();
        
    } catch (error) {
        console.error('Error resetting score:', error);
        alert('Error resetting your score. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Event listeners
document.getElementById('redBtn').addEventListener('click', () => addClick('red'));
document.getElementById('blueBtn').addEventListener('click', () => addClick('blue'));
document.getElementById('resetBtn').addEventListener('click', resetScore);

// Load stats when page loads
loadStats();
