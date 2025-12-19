"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  CheckCircle, 
  Send, 
  Users, 
  BarChart3, 
  Zap,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";
import { AnimatedText } from "@/components/AnimatedText";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calculate dashboard animation progress based on scroll
  const dashboardProgress = Math.min(scrollY / 400, 1);
  const dashboardOpacity = Math.min(scrollY / 200, 1);
  const dashboardTransform = `
    perspective(1000px) 
    rotateX(${45 - (dashboardProgress * 45)}deg) 
    translateY(${50 - (dashboardProgress * 50)}px)
    scale(${0.8 + (dashboardProgress * 0.2)})
  `;

  return (
    <div style={{ fontFamily: '"Google Sans", "Google Sans Display", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Hero Section */}
      <div style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        paddingBottom: '128px',
        paddingTop: '80px'
      }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff' }} />
        
        {/* Grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Animated background elements */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Central radiant aura */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'pulse 4s ease-in-out infinite'
          }} />
          
          {/* Secondary glow effects */}
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 211, 102, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(18, 140, 126, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} />
        </div>

        {/* Cursor following effect */}
        <div 
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 10,
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)',
            transition: 'all 0.3s ease-out',
            background: 'radial-gradient(circle, rgba(37, 211, 102, 0.4) 0%, rgba(37, 211, 102, 0.2) 40%, transparent 70%)',
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />

        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '16px 32px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                              }}>
                <MessageSquare style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#111' }}>DBULK</span>
            </Link>
            
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <a href="#features" style={{ fontSize: '15px', fontWeight: 500, color: '#666', textDecoration: 'none' }}>Features</a>
              <a href="#pricing" style={{ fontSize: '15px', fontWeight: 500, color: '#666', textDecoration: 'none' }}>Pricing</a>
              <Link href="/login" style={{ fontSize: '15px', fontWeight: 600, color: '#333', textDecoration: 'none' }}>Sign In</Link>
              <Link href="/signup" style={{
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
                borderRadius: '10px',
                textDecoration: 'none',
                              }}>
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Content */}
        <div style={{ 
          position: 'relative', 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 32px', 
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginTop: '32px'
        }}>
          <div style={{
            transition: 'all 1s ease-out',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(40px)'
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 20px',
              marginBottom: '32px',
              backgroundColor: 'rgba(37, 211, 102, 0.1)',
              borderRadius: '100px',
              border: '1px solid rgba(37, 211, 102, 0.2)'
            }}>
              <CheckCircle style={{ width: '16px', height: '16px', color: '#25D366', marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#25D366' }}>Trusted by 10,000+ Businesses Worldwide</span>
            </div>

            {/* Main heading */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '56px', 
                fontWeight: 800, 
                color: '#111', 
                lineHeight: 1.1,
                marginBottom: '8px'
              }}>
                <AnimatedText 
                  text="Transform Your" 
                  delay={200}
                />
              </div>
              <div style={{ 
                fontSize: '56px', 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}>
                <AnimatedText 
                  text="WhatsApp Marketing" 
                  delay={800}
                />
              </div>
            </div>
            
            <p style={{ 
              fontSize: '20px', 
              color: '#666', 
              marginBottom: '40px', 
              maxWidth: '700px', 
              margin: '0 auto 40px',
              lineHeight: 1.7
            }}>
              Send bulk messages, automate campaigns, and engage customers at scale with our powerful WhatsApp Business API platform.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: '48px' }}>
              <Link href="/signup" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
                borderRadius: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}>
                Start Free Trial
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#333',
                backgroundColor: 'white',
                border: '2px solid #e5e5e5',
                borderRadius: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}>
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#25D366', marginBottom: '4px' }}>99.9%</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Delivery Rate</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#25D366', marginBottom: '4px' }}>24/7</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Support</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#25D366', marginBottom: '4px' }}>50M+</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Messages Sent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 32px', 
          marginTop: '48px' 
        }}>
          <div 
            style={{
              position: 'relative',
              transition: 'all 0.7s ease-out',
              opacity: Math.max(0.4, dashboardOpacity),
              transform: dashboardTransform,
            }}
          >
            {/* Dashboard mockup container */}
            <div style={{
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '20px',
              border: '1px solid #e5e5e5',
              overflow: 'hidden'
            }}>
              {/* Browser header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #e5e5e5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }} />
                </div>
                <div style={{ 
                  flex: 1, 
                  maxWidth: '400px', 
                  margin: '0 24px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e5e5',
                  fontSize: '13px',
                  color: '#999'
                }}>
                  app.dbulk.io/dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    JD
                  </div>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div style={{ display: 'flex', height: '500px' }}>
                {/* Left Sidebar */}
                <div style={{ width: '220px', backgroundColor: '#fafafa', borderRight: '1px solid #f0f0f0', padding: '20px 16px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <MessageSquare style={{ width: '18px', height: '18px', color: 'white' }} />
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>DBULK</span>
                    </div>
                  </div>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#25D366', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
                      <BarChart3 style={{ width: '18px', height: '18px' }} />
                      Dashboard
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', color: '#666', borderRadius: '10px', fontSize: '14px' }}>
                      <MessageSquare style={{ width: '18px', height: '18px' }} />
                      Campaigns
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', color: '#666', borderRadius: '10px', fontSize: '14px' }}>
                      <Users style={{ width: '18px', height: '18px' }} />
                      Contacts
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', color: '#666', borderRadius: '10px', fontSize: '14px' }}>
                      <Send style={{ width: '18px', height: '18px' }} />
                      Templates
                    </div>
                  </nav>
                </div>
                
                {/* Main Content */}
                <div style={{ flex: 1, padding: '24px', backgroundColor: '#f8fafc' }}>
                  {/* Welcome Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>Welcome back! 👋</h2>
                    <p style={{ fontSize: '14px', color: '#666' }}>Here's your WhatsApp marketing overview</p>
                  </div>
                  
                  {/* Stats Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                      { label: 'Messages Sent', value: '8,547', change: '+12.5%', icon: Send, color: '#25D366' },
                      { label: 'Delivered', value: '8,249', change: '+3.2%', icon: CheckCircle, color: '#25D366' },
                      { label: 'Read Rate', value: '78.5%', change: '+5.1%', icon: TrendingUp, color: '#128C7E' },
                      { label: 'Active Campaigns', value: '5', change: '+2', icon: Zap, color: '#128C7E' }
                    ].map((stat, index) => (
                      <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: stat.color + '15',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <stat.icon style={{ width: '18px', height: '18px', color: stat.color }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                            {stat.change}
                          </span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{stat.value}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Charts Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    {/* Chart */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>Weekly Performance</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '12px' }}>
                        {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '100%',
                              height: `${height}%`,
                              background: 'linear-gradient(180deg, #25D366 0%, #128C7E 100%)',
                              borderRadius: '6px'
                            }} />
                            <span style={{ fontSize: '11px', color: '#999' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Recent Campaigns */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>Recent Campaigns</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { name: 'Summer Sale', status: 'Active', color: '#25D366' },
                          { name: 'Product Launch', status: 'Completed', color: '#128C7E' },
                          { name: 'Newsletter', status: 'Scheduled', color: '#1DA851' }
                        ].map((campaign, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#333' }}>{campaign.name}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: campaign.color, backgroundColor: campaign.color + '15', padding: '3px 8px', borderRadius: '10px' }}>
                              {campaign.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div style={{
              position: 'absolute',
              top: '-16px',
              right: '-16px',
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              borderRadius: '50%',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-24px',
              left: '-24px',
              width: '48px',
              height: '48px',
              background: 'rgba(37, 211, 102, 0.2)',
              borderRadius: '50%',
              filter: 'blur(8px)',
              animation: 'pulse 2s ease-in-out infinite 0.5s'
            }} />
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <section style={{ padding: '80px 32px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
            Trusted by <span style={{ fontWeight: 700, color: '#25D366' }}>10,000+</span> Businesses across <span style={{ fontWeight: 700, color: '#25D366' }}>50+</span> Countries
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { name: 'TechCorp', width: 120 },
              { name: 'GlobalRetail', width: 130 },
              { name: 'FinanceHub', width: 110 },
              { name: 'HealthPlus', width: 125 },
              { name: 'EduLearn', width: 115 },
              { name: 'TravelMax', width: 120 }
            ].map((company, i) => (
              <div key={i} style={{ 
                width: company.width, 
                height: '40px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={`https://placehold.co/${company.width}x40/f5f5f5/999999?text=${company.name}`}
                  alt={company.name}
                  style={{ height: '100%', objectFit: 'contain', opacity: 0.7 }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Broadcast Section */}
      <section style={{ padding: '100px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ 
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
                borderRadius: '100px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#25D366' }}>📢 Official WhatsApp Partner</span>
              </div>
              <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#111', marginBottom: '20px', lineHeight: 1.2 }}>
                Broadcast Promotional Messages on WhatsApp (Officially)
              </h2>
              <p style={{ fontSize: '17px', color: '#666', lineHeight: 1.8, marginBottom: '32px' }}>
                Send unlimited promotional messages to your customers without getting banned. As an official WhatsApp Business API partner, we ensure 100% compliance and maximum deliverability.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  'Send to unlimited contacts at once',
                  'No risk of account ban',
                  'Track delivery & read receipts',
                  'Schedule campaigns in advance'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#25D366' }} />
                    <span style={{ fontSize: '15px', color: '#333' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
                borderRadius: '12px',
                textDecoration: 'none',
                }}>
                Start Broadcasting
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid #f0f0f0',
              overflow: 'hidden'
            }}>
              <img 
                src="https://placehold.co/500x320/f8fafc/25D366?text=WhatsApp+Campaign+Dashboard"
                alt="Campaign Dashboard Preview"
                style={{ width: '100%', height: 'auto', borderRadius: '16px', marginBottom: '24px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111' }}>Campaign Sent!</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Summer Sale 2025</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#25D366' }}>5,247</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Delivered</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#128C7E' }}>4,128</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Read</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1DA851' }}>892</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Replied</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section style={{ padding: '100px 32px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
              Get Started with Powerful Features
            </h2>
            <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              DBULK launches latest WhatsApp and AI Features at blazing fast speed ⚡
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { 
                icon: TrendingUp, 
                title: 'Click to WhatsApp Ads', 
                description: 'Run Ads on Facebook & Instagram that land on WhatsApp. 5X your lead generation & 2-3X conversions instantly!',
                color: '#25D366',
                image: 'https://placehold.co/320x180/e8f5e9/25D366?text=WhatsApp+Ads'
              },
              { 
                icon: MessageSquare, 
                title: 'WhatsApp Forms', 
                description: 'Build interactive forms within WhatsApp to collect customer data, feedback, and orders seamlessly.',
                color: '#128C7E',
                image: 'https://placehold.co/320x180/e0f2f1/128C7E?text=WhatsApp+Forms'
              },
              { 
                icon: Shield, 
                title: 'Collect Payments', 
                description: 'Accept payments directly on WhatsApp with integrated payment gateways. Boost your conversion rates!',
                color: '#1DA851',
                image: 'https://placehold.co/320x180/e8f5e9/1DA851?text=Payments'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: '#f8fafc',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s'
              }}>
                <img 
                  src={feature.image}
                  alt={feature.title}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: feature.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <feature.icon style={{ width: '22px', height: '22px', color: feature.color }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111' }}>{feature.title}</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7, marginBottom: '20px' }}>{feature.description}</p>
                <Link href="/features" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: feature.color,
                  textDecoration: 'none'
                }}>
                  Explore
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="features" style={{ padding: '100px 32px', backgroundColor: '#111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
              Advanced Features that Drive Conversions
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to scale your WhatsApp marketing
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {[
              { 
                icon: Users, 
                title: 'Multiple Human Live Chat', 
                description: 'Have multiple team members drive Live Chat Support on the same WhatsApp Business Number. Filter chats according to tags, campaigns and attributes for smart agent routing.'
              },
              { 
                icon: BarChart3, 
                title: 'Real-Time Analytics', 
                description: 'Track your campaign results in real-time. Monitor Read, Replied & Clicked rates for each campaign and retarget smartly for higher conversions!'
              },
              { 
                icon: Zap, 
                title: 'Build No-Code Chatbot in Minutes', 
                description: 'Build your own Chatbot Flows your way! Easy-to-use Chatbot & Catalog Flow builder to build your conversational journeys.'
              },
              { 
                icon: Send, 
                title: 'Import & Broadcast Instantly', 
                description: 'Simply import all your contacts and broadcast approved messages instantly. See real-time analytics for delivered, read rates and more.'
              }
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <feature.icon style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '100px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
              Customers Love Us! ❤️
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              See what our customers have to say about DBULK
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { 
                name: 'Rahul Sharma', 
                role: 'Marketing Head, TechStartup',
                text: 'DBULK has transformed our customer engagement. We saw a 3X increase in response rates within the first month!',
                rating: 5
              },
              { 
                name: 'Priya Patel', 
                role: 'Founder, E-commerce Store',
                text: 'The bulk messaging feature is incredible. We can now reach all our customers instantly with promotional offers.',
                rating: 5
              },
              { 
                name: 'Amit Kumar', 
                role: 'Sales Director, RetailCo',
                text: 'Best WhatsApp marketing platform we have used. The analytics and automation features are game-changers.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '20px', height: '20px', color: '#25D366', fill: '#25D366' }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.7, marginBottom: '24px' }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 32px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              No hidden fees. Start free and scale as you grow.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { 
                name: 'Starter', 
                price: 'Free',
                period: 'forever',
                description: 'Perfect for getting started',
                features: ['1,000 messages/month', 'Basic analytics', 'Email support', '1 team member'],
                popular: false
              },
              { 
                name: 'Professional', 
                price: '₹2,499',
                period: '/month',
                description: 'Best for growing businesses',
                features: ['50,000 messages/month', 'Advanced analytics', 'Priority support', '5 team members', 'Chatbot builder', 'API access'],
                popular: true
              },
              { 
                name: 'Enterprise', 
                price: 'Custom',
                period: '',
                description: 'For large scale operations',
                features: ['Unlimited messages', 'Custom integrations', 'Dedicated support', 'Unlimited team', 'White-label option', 'SLA guarantee'],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} style={{
                backgroundColor: plan.popular ? '#111' : 'white',
                borderRadius: '24px',
                padding: '40px 32px',
                                border: plan.popular ? 'none' : '1px solid #f0f0f0',
                position: 'relative',
                transform: plan.popular ? 'scale(1.05)' : 'none'
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 20px',
                    backgroundColor: '#25D366',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: plan.popular ? 'white' : '#111', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ fontSize: '14px', color: plan.popular ? 'rgba(255,255,255,0.7)' : '#666', marginBottom: '24px' }}>{plan.description}</p>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '48px', fontWeight: 700, color: plan.popular ? 'white' : '#111' }}>{plan.price}</span>
                  <span style={{ fontSize: '16px', color: plan.popular ? 'rgba(255,255,255,0.7)' : '#666' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle style={{ width: '18px', height: '18px', color: '#25D366' }} />
                      <span style={{ fontSize: '14px', color: plan.popular ? 'rgba(255,255,255,0.9)' : '#333' }}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: plan.popular ? '#111' : 'white',
                  backgroundColor: plan.popular ? 'white' : '#25D366',
                  borderRadius: '12px',
                  textDecoration: 'none'
                }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '100px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
              Frequently Asked Questions
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { 
                question: 'What does DBULK do?', 
                answer: 'DBULK provides businesses with a WhatsApp marketing software to broadcast & automate messages, run Click to WhatsApp Ads, build chatbots, provide multi-agent live chat support, and much more.'
              },
              { 
                question: 'Is DBULK an Official WhatsApp Marketing Software?', 
                answer: 'Yes! DBULK is an official WhatsApp Business API partner. We provide fully compliant WhatsApp marketing solutions that won\'t get your number banned.'
              },
              { 
                question: 'Does DBULK offer a FREE account?', 
                answer: 'Yes, we offer a free starter plan with 1,000 messages per month. No credit card required to get started.'
              },
              { 
                question: 'How many messages can I broadcast in a day?', 
                answer: 'You start with 1,000 messages/day. As you send more messages, your limit automatically upgrades to 10,000, then 100,000, and eventually unlimited messages per day.'
              },
              { 
                question: 'How do you handle Customer Support?', 
                answer: 'We have a dedicated customer support team available via Live Chat, Email, Call & Zoom. We\'re here to help with everything you need.'
              }
            ].map((faq, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px 28px',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{ fontSize: '17px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>{faq.question}</h4>
                <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.7 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '100px 32px',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '20px' }}>
            Ready to 5X Your Revenue with WhatsApp?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>
            Join 10,000+ businesses already using DBULK to reach their customers on WhatsApp
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/signup" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 40px',
              fontSize: '17px',
              fontWeight: 600,
              color: '#25D366',
              backgroundColor: 'white',
              borderRadius: '14px',
              textDecoration: 'none',
                          }}>
              Get Started Free
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
            <Link href="/demo" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '18px 40px',
              fontSize: '17px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: 'transparent',
              border: '2px solid white',
              borderRadius: '14px',
              textDecoration: 'none'
            }}>
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 32px 40px', backgroundColor: '#111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '48px', marginBottom: '60px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageSquare style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'white' }}>DBULK</span>
              </div>
              <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7, maxWidth: '280px' }}>
                The smartest WhatsApp Marketing Platform. Broadcast messages, automate campaigns, and grow your business.
              </p>
            </div>
            
            {/* Platform */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Features', 'Pricing', 'Integrations', 'API'].map((item, i) => (
                  <a key={i} href="#" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
            
            {/* Resources */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Help Center', 'Blog', 'Guides', 'Webinars'].map((item, i) => (
                  <a key={i} href="#" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
            
            {/* Company */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['About Us', 'Careers', 'Contact', 'Partners'].map((item, i) => (
                  <a key={i} href="#" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
            
            {/* Legal */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map((item, i) => (
                  <a key={i} href="#" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom */}
          <div style={{ borderTop: '1px solid #333', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              © 2025 DBULK. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((social, i) => (
                <a key={i} href="#" style={{ fontSize: '14px', color: '#888', textDecoration: 'none' }}>{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
