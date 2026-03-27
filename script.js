
const SUPABASE_URL = 'https://qpbnivtoewrcjjafauoi.supabase.co';  // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwYm5pdnRvZXdyY2pqYWZhdW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjAzNDIsImV4cCI6MjA5MDE5NjM0Mn0.gxpSV9SrvV_QQA5fIAhU_voAxoSUcsutscCgFV4AaqY';  // Your anon public key


console.log('🔵 Script loaded');

// Initialize Supabase client - use a different variable name
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase client initialized');

// Get or create user ID
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('userId', userId);
}
console.log('👤 User ID:', userId);

// Test database connection
async function testConnection() {
    console.log('🔄 Testing database connection...');
    
    // Try to read from the table
    const { data, error } = await supabaseClient
        .from('clicks')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('❌ Database connection failed:', error);
        alert('Database error: ' + error.message);
    } else {
        console.log('✅ Database connection successful!');
        console.log('Sample data:', data);
    }
}

// Load stats from database
async function loadStats() {
    console.log('🔄 Loading stats...');
    
    try {
        // Get user's score
        const { count, error: userError } = await supabaseClient
            .from('clicks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (userError) {
            console.error('❌ Error loading user stats:', userError);
            return;
        }
        
        let yourScore = count || 0;
        document.getElementById('yourScore').textContent = yourScore;
        console.log('✅ User score loaded:', yourScore);
        
        // Get global stats
        const { data: globalStats, error: globalError } = await supabaseClient
            .rpc('get_global_stats');
        
        if (globalError) {
            console.error('❌ Error loading global stats:', globalError);
            // Fallback: calculate manually
            const { data: allClicks, error: allError } = await supabaseClient
                .from('clicks')
                .select('color');
            
            if (!allError && allClicks) {
                const redCount = allClicks.filter(c => c.color === 'red').length;
                const blueCount = allClicks.filter(c => c.color === 'blue').length;
                document.getElementById('globalRed').textContent = redCount;
                document.getElementById('globalBlue').textContent = blueCount;
                document.getElementById('globalTotal').textContent = allClicks.length;
                console.log('✅ Global stats calculated manually:', { redCount, blueCount, total: allClicks.length });
            }
            return;
        }
        
        if (globalStats && globalStats[0]) {
            document.getElementById('globalRed').textContent = globalStats[0].red_count || 0;
            document.getElementById('globalBlue').textContent = globalStats[0].blue_count || 0;
            document.getElementById('globalTotal').textContent = globalStats[0].total_count || 0;
            console.log('✅ Global stats loaded:', globalStats[0]);
        }
        
    } catch (error) {
        console.error('❌ LoadStats error:', error);
    }
}

// Add a click
async function addClick(color) {
    console.log(`🖱️ Click detected: ${color}`);
    
    try {
        // Insert the click
        const { data, error } = await supabaseClient
            .from('clicks')
            .insert([
                { user_id: userId, color: color }
            ])
            .select();
        
        if (error) {
            console.error('❌ Error inserting click:', error);
            alert('Error saving click: ' + error.message);
            return;
        }
        
        console.log('✅ Click saved:', data);
        
        // Reload stats
        await loadStats();
        
    } catch (error) {
        console.error('❌ AddClick error:', error);
        alert('Error: ' + error.message);
    }
}

// Reset user's score
async function resetScore() {
    if (!confirm('Are you sure you want to reset your score?')) {
        return;
    }
    
    console.log('🔄 Resetting score for user:', userId);
    
    try {
        const { error } = await supabaseClient
            .from('clicks')
            .delete()
            .eq('user_id', userId);
        
        if (error) {
            console.error('❌ Error resetting:', error);
            alert('Error resetting: ' + error.message);
            return;
        }
        
        console.log('✅ Score reset');
        await loadStats();
        
    } catch (error) {
        console.error('❌ Reset error:', error);
    }
}

// Set up event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Page loaded, setting up event listeners');
    
    // Test connection
    testConnection();
    
    // Load initial stats
    loadStats();
    
    // Set up buttons
    const redBtn = document.getElementById('redBtn');
    const blueBtn = document.getElementById('blueBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (redBtn) {
        redBtn.addEventListener('click', () => addClick('red'));
        console.log('✅ Red button listener added');
    } else {
        console.error('❌ Red button not found!');
    }
    
    if (blueBtn) {
        blueBtn.addEventListener('click', () => addClick('blue'));
        console.log('✅ Blue button listener added');
    } else {
        console.error('❌ Blue button not found!');
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetScore);
        console.log('✅ Reset button listener added');
    } else {
        console.error('❌ Reset button not found!');
    }
});
