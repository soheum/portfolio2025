import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import React from 'react';

function App() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = (e) => {
      // Prevent actual scrolling
      e.preventDefault();
      
      // Update scroll position based on wheel delta
      setScrollPosition(prev => {
        const newPosition = prev + (e.deltaY * 0.2); // Reduced scroll sensitivity further
        // Constrain the scroll position between 0 and 600
        return Math.max(0, Math.min(600, newPosition));
      });
    };

    window.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

  // Calculate visibility based on scroll position
  const isVisible = (index) => {
    const thresholds = [0, 100, 200, 300, 400, 500]; // Added one more threshold
    return scrollPosition > thresholds[index];
  };

  // Add this script to handle the mouse interaction
  useEffect(() => {
    const textElements = document.querySelectorAll('.interactive-text');
    if (!textElements.length) return;

    const handleMouseMove = (e, text) => {
      const rect = text.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      
      const letters = Array.from(text.querySelectorAll('.letter'));
      
      // Find the closest letter
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      letters.forEach((letter, index) => {
        const letterRect = letter.getBoundingClientRect();
        const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
        const distance = Math.abs(mouseX - letterCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Reset all letters
      letters.forEach(letter => {
        letter.style.color = '';
        letter.style.setProperty('--x', '0px');
      });

      // Only color the letters immediately adjacent to the cursor
      const maxDistance = 100;
      const maxSpacing = 3;

      // Find which two letters the cursor is between
      let leftIndex = -1;
      let rightIndex = -1;

      for (let i = 0; i < letters.length - 1; i++) {
        const leftRect = letters[i].getBoundingClientRect();
        const rightRect = letters[i + 1].getBoundingClientRect();
        const leftCenter = leftRect.left + leftRect.width / 2 - rect.left;
        const rightCenter = rightRect.left + rightRect.width / 2 - rect.left;
        
        if (mouseX >= leftCenter && mouseX <= rightCenter) {
          leftIndex = i;
          rightIndex = i + 1;
          break;
        }
      }

      // Determine which color to use based on the text content
      const textContent = text.textContent.toLowerCase();
      let hoverColor;
      if (textContent.includes('scarlet')) {
        hoverColor = '#FFE8A9';
      } else if (textContent.includes('bank')) {
        hoverColor = '#A9C3FF';
      } else if (textContent.includes('mckinsey')) {
        hoverColor = '#84FFE7';
      }

      // Color only the two letters the cursor is between
      if (leftIndex >= 0 && hoverColor) letters[leftIndex].style.color = hoverColor;
      if (rightIndex >= 0 && hoverColor) letters[rightIndex].style.color = hoverColor;

      // Apply spacing to all letters based on distance
      letters.forEach((letter, index) => {
        const letterRect = letter.getBoundingClientRect();
        const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
        const distance = Math.abs(mouseX - letterCenter);
        
        if (distance < maxDistance) {
          const spacing = (1 - Math.pow(distance / maxDistance, 2)) * maxSpacing;
          const direction = letterCenter < mouseX ? -1 : 1;
          letter.style.setProperty('--x', `${spacing * direction}px`);
        }
      });
    };

    const handleMouseLeave = (text) => {
      const letters = text.querySelectorAll('.letter');
      letters.forEach(letter => {
        letter.style.setProperty('--x', '0px');
        letter.style.color = '';
      });
    };

    // Create event handler functions for each element
    const mouseMoveHandlers = new Map();
    const mouseLeaveHandlers = new Map();

    textElements.forEach(text => {
      const moveHandler = (e) => handleMouseMove(e, text);
      const leaveHandler = () => handleMouseLeave(text);
      
      mouseMoveHandlers.set(text, moveHandler);
      mouseLeaveHandlers.set(text, leaveHandler);
      
      text.addEventListener('mousemove', moveHandler);
      text.addEventListener('mouseleave', leaveHandler);
    });

    return () => {
      textElements.forEach(text => {
        const moveHandler = mouseMoveHandlers.get(text);
        const leaveHandler = mouseLeaveHandlers.get(text);
        
        text.removeEventListener('mousemove', moveHandler);
        text.removeEventListener('mouseleave', leaveHandler);
      });
    };
  }, []);

  // Add this new useEffect for the falling text animation
  useEffect(() => {
    const fallText = document.querySelector('.fall-text');
    if (!fallText) return;

    const handleMouseMove = (e, text) => {
      const rect = text.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const letters = Array.from(text.querySelectorAll('.letter'));
      
      // Find the closest letter to the cursor
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      letters.forEach((letter, index) => {
        const letterRect = letter.getBoundingClientRect();
        const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
        const distance = Math.abs(mouseX - letterCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Reset all letters
      letters.forEach(letter => {
        letter.style.setProperty('--fall-y', '0px');
        letter.style.color = 'white';
      });

      // Animate letters outward from cursor position
      const animateLetter = (index, delay) => {
        if (index >= 0 && index < letters.length) {
          setTimeout(() => {
            letters[index].style.setProperty('--fall-y', '-3px');
            letters[index].style.color = '#FFE8A9';
            
            setTimeout(() => {
              letters[index].style.setProperty('--fall-y', '0px');
            }, 500);
          }, delay);
        }
      };

      // Animate outward from cursor position
      for (let i = 0; i <= letters.length; i++) {
        // Animate right side
        animateLetter(closestIndex + i, i * 50);
        // Animate left side
        if (i !== 0) {
          animateLetter(closestIndex - i, i * 50);
        }
      }
    };

    const handleMouseLeave = (text) => {
      const letters = text.querySelectorAll('.letter');
      letters.forEach(letter => {
        letter.style.setProperty('--fall-y', '0px');
        letter.style.color = 'white';
      });
    };

    // Add event listeners
    const mouseMoveHandler = (e) => handleMouseMove(e, fallText);
    const mouseLeaveHandler = () => handleMouseLeave(fallText);
    
    fallText.addEventListener('mousemove', mouseMoveHandler);
    fallText.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      fallText.removeEventListener('mousemove', mouseMoveHandler);
      fallText.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, []);

  // First, make sure the FallingText component is defined at the top level
  const FallingText = ({ text }) => {
    useEffect(() => {
      const fallText = document.querySelector('.fall-text');
      if (!fallText) return;

      let activeTimeouts = [];

      const handleMouseMove = (e, text) => {
        const rect = text.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const letters = Array.from(text.querySelectorAll('.letter'));
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        letters.forEach((letter, index) => {
          const letterRect = letter.getBoundingClientRect();
          const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
          const distance = Math.abs(mouseX - letterCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        letters.forEach(letter => {
          letter.style.setProperty('--fall-y', '0px');
          letter.style.color = 'white';
        });

        const animateLetter = (index, delay) => {
          if (index >= 0 && index < letters.length) {
            const timeout1 = setTimeout(() => {
              letters[index].style.setProperty('--fall-y', '-3px');
              letters[index].style.color = '#FFE8A9';
              
              const timeout2 = setTimeout(() => {
                letters[index].style.setProperty('--fall-y', '0px');
              }, 500);
              activeTimeouts.push(timeout2);
            }, delay);
            activeTimeouts.push(timeout1);
          }
        };

        for (let i = 0; i <= letters.length; i++) {
          animateLetter(closestIndex + i, i * 50);
          if (i !== 0) {
            animateLetter(closestIndex - i, i * 50);
          }
        }
      };

      const handleMouseLeave = (text) => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];

        const letters = text.querySelectorAll('.letter');
        letters.forEach(letter => {
          letter.style.setProperty('--fall-y', '0px');
          letter.style.color = 'white';
        });
      };

      const mouseMoveHandler = (e) => handleMouseMove(e, fallText);
      const mouseLeaveHandler = () => handleMouseLeave(fallText);
      
      fallText.addEventListener('mousemove', mouseMoveHandler);
      fallText.addEventListener('mouseleave', mouseLeaveHandler);

      return () => {
        fallText.removeEventListener('mousemove', mouseMoveHandler);
        fallText.removeEventListener('mouseleave', mouseLeaveHandler);
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
      };
    }, []);

    return (
      <span className="fall-text">
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <React.Fragment key={wordIndex}>
            <span className="word">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="letter">
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < wordsArray.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Create a new FallingText2 component for the other text elements
  const FallingText2 = ({ text }) => {
    useEffect(() => {
      const fallText2 = document.querySelector('.fall-text2');
      if (!fallText2) return;

      let activeTimeouts = [];

      const handleMouseMove = (e, text) => {
        const rect = text.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const letters = Array.from(text.querySelectorAll('.letter'));
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        letters.forEach((letter, index) => {
          const letterRect = letter.getBoundingClientRect();
          const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
          const distance = Math.abs(mouseX - letterCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        letters.forEach(letter => {
          letter.style.setProperty('--fall-y2', '0px');
          letter.style.color = 'white';
        });

        const animateLetter = (index, delay) => {
          if (index >= 0 && index < letters.length) {
            const timeout1 = setTimeout(() => {
              letters[index].style.setProperty('--fall-y2', '-3px');
              letters[index].style.color = '#A9C3FF';
              
              const timeout2 = setTimeout(() => {
                letters[index].style.setProperty('--fall-y2', '0px');
              }, 500);
              activeTimeouts.push(timeout2);
            }, delay);
            activeTimeouts.push(timeout1);
          }
        };

        for (let i = 0; i <= letters.length; i++) {
          animateLetter(closestIndex + i, i * 50);
          if (i !== 0) {
            animateLetter(closestIndex - i, i * 50);
          }
        }
      };

      const handleMouseLeave = (text) => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];

        const letters = text.querySelectorAll('.letter');
        letters.forEach(letter => {
          letter.style.setProperty('--fall-y2', '0px');
          letter.style.color = 'white';
        });
      };

      const mouseMoveHandler = (e) => handleMouseMove(e, fallText2);
      const mouseLeaveHandler = () => handleMouseLeave(fallText2);
      
      fallText2.addEventListener('mousemove', mouseMoveHandler);
      fallText2.addEventListener('mouseleave', mouseLeaveHandler);

      return () => {
        fallText2.removeEventListener('mousemove', mouseMoveHandler);
        fallText2.removeEventListener('mouseleave', mouseLeaveHandler);
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
      };
    }, []);

    return (
      <span className="fall-text2" style={{ '--fall-y2': '0px' }}>
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <React.Fragment key={wordIndex}>
            <span className="word">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="letter" style={{ transform: 'translateY(var(--fall-y2))' }}>
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < wordsArray.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Create a new FallingText3 component for the other text elements
  const FallingText3 = ({ text }) => {
    useEffect(() => {
      const fallText3 = document.querySelector('.fall-text3');
      if (!fallText3) return;

      let activeTimeouts = [];

      const handleMouseMove = (e, text) => {
        const rect = text.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const letters = Array.from(text.querySelectorAll('.letter'));
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        letters.forEach((letter, index) => {
          const letterRect = letter.getBoundingClientRect();
          const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
          const distance = Math.abs(mouseX - letterCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        letters.forEach(letter => {
          letter.style.setProperty('--fall-y3', '0px');
          letter.style.color = 'white';
        });

        const animateLetter = (index, delay) => {
          if (index >= 0 && index < letters.length) {
            const timeout1 = setTimeout(() => {
              letters[index].style.setProperty('--fall-y3', '-3px');
              letters[index].style.color = '#84FFE7';
              
              const timeout2 = setTimeout(() => {
                letters[index].style.setProperty('--fall-y3', '0px');
              }, 500);
              activeTimeouts.push(timeout2);
            }, delay);
            activeTimeouts.push(timeout1);
          }
        };

        for (let i = 0; i <= letters.length; i++) {
          animateLetter(closestIndex + i, i * 50);
          if (i !== 0) {
            animateLetter(closestIndex - i, i * 50);
          }
        }
      };

      const handleMouseLeave = (text) => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];

        const letters = text.querySelectorAll('.letter');
        letters.forEach(letter => {
          letter.style.setProperty('--fall-y3', '0px');
          letter.style.color = 'white';
        });
      };

      const mouseMoveHandler = (e) => handleMouseMove(e, fallText3);
      const mouseLeaveHandler = () => handleMouseLeave(fallText3);
      
      fallText3.addEventListener('mousemove', mouseMoveHandler);
      fallText3.addEventListener('mouseleave', mouseLeaveHandler);

      return () => {
        fallText3.removeEventListener('mousemove', mouseMoveHandler);
        fallText3.removeEventListener('mouseleave', mouseLeaveHandler);
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
      };
    }, []);

    return (
      <span className="fall-text3" style={{ '--fall-y3': '0px' }}>
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <React.Fragment key={wordIndex}>
            <span className="word">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="letter" style={{ transform: 'translateY(var(--fall-y3))' }}>
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < wordsArray.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Create a new AutoFallingText component for the initial text
  const AutoFallingText = ({ text }) => {
    useEffect(() => {
      const autoFallText = document.querySelector('.auto-fall-text');
      if (!autoFallText) return;

      const letters = Array.from(autoFallText.querySelectorAll('.letter'));
      let activeTimeouts = [];

      const animateLetter = (index, delay) => {
        if (index >= 0 && index < letters.length) {
          const timeout1 = setTimeout(() => {
            letters[index].style.setProperty('--fall-y4', '-3px');
            letters[index].style.color = 'white';
            
            const timeout2 = setTimeout(() => {
              letters[index].style.setProperty('--fall-y4', '0px');
              letters[index].style.color = 'white';
            }, 500);
            activeTimeouts.push(timeout2);
          }, delay);
          activeTimeouts.push(timeout1);
        }
      };

      // Start the animation sequence
      for (let i = 0; i < letters.length; i++) {
        animateLetter(i, i * 100);
      }

      // Set up a repeating animation with a counter
      let repeatCount = 0;
      const maxRepeats = 2;
      
      const interval = setInterval(() => {
        if (repeatCount >= maxRepeats) {
          clearInterval(interval);
          return;
        }
        
        for (let i = 0; i < letters.length; i++) {
          animateLetter(i, i * 100);
        }
        repeatCount++;
      }, 3000); // Repeat every 3 seconds

      return () => {
        clearInterval(interval);
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
      };
    }, []);

    return (
      <span className="auto-fall-text" style={{ '--fall-y4': '0px' }}>
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <React.Fragment key={wordIndex}>
            <span className="word">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="letter" style={{ transform: 'translateY(var(--fall-y4))' }}>
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < wordsArray.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  };

  // Create a new HoverFallingText component for hover interactions
  const HoverFallingText = ({ text, className }) => {
    useEffect(() => {
      const hoverFallText = document.querySelector(`.${className}`);
      if (!hoverFallText) return;

      const letters = Array.from(hoverFallText.querySelectorAll('.letter'));
      let activeTimeouts = [];

      const animateLetter = (index, delay) => {
        if (index >= 0 && index < letters.length) {
          const timeout1 = setTimeout(() => {
            letters[index].style.setProperty('--fall-y5', '-3px');
            letters[index].style.color = 'white';
            
            const timeout2 = setTimeout(() => {
              letters[index].style.setProperty('--fall-y5', '0px');
              letters[index].style.color = 'white';
            }, 500);
            activeTimeouts.push(timeout2);
          }, delay);
          activeTimeouts.push(timeout1);
        }
      };

      const handleMouseEnter = () => {
        for (let i = 0; i < letters.length; i++) {
          animateLetter(i, i * 100);
        }
      };

      const handleMouseLeave = () => {
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];
        letters.forEach(letter => {
          letter.style.setProperty('--fall-y5', '0px');
          letter.style.color = '#666666'; // Change back to gray color
        });
      };

      hoverFallText.addEventListener('mouseenter', handleMouseEnter);
      hoverFallText.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        hoverFallText.removeEventListener('mouseenter', handleMouseEnter);
        hoverFallText.removeEventListener('mouseleave', handleMouseLeave);
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
      };
    }, [className]);

    return (
      <span className={className} style={{ '--fall-y5': '0px', color: '#666666' }}>
        {text.split(' ').map((word, wordIndex, wordsArray) => (
          <React.Fragment key={wordIndex}>
            <span className="word">
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="letter" style={{ transform: 'translateY(var(--fall-y5))' }}>
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < wordsArray.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="App">
      <div className="grid-container">

        {/* Middle section - 50% */}
        <div className="grid-section main-content" style={{ width: '50%', position: 'relative', minHeight: '100vh' }}>
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
            <div className={`line-group ${!isVisible(0) ? 'visible' : ''}`}>
              <div className="text-gray"><AutoFallingText text="Scroll down for more" /></div>
            </div>
            <div className={`line-group ${isVisible(0) ? 'visible' : ''}`}>
              <div className="text-white">Hello I'm Soheum Hwang</div>
            </div>
            <div className={`line-group ${isVisible(1) ? 'visible' : ''}`}>
              <div className="text-gray" style={{ lineHeight: '1.6em' }}>I'm currently designing experiences to <FallingText text="accelerate medical software devices to market" /> <a href="https://www.scarlet.cc/" target="_blank" rel="noopener noreferrer" className="text-gray">
                  <span className="interactive-text" style={{ fontStyle: 'italic' }}>
                    <span className="letter">a</span>
                    <span className="letter">t</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">S</span>
                    <span className="letter">c</span>
                    <span className="letter">a</span>
                    <span className="letter">r</span>
                    <span className="letter">l</span>
                    <span className="letter">e</span>
                    <span className="letter">t.</span>
                  </span>
                </a><span className={`text-gray ${isVisible(2) ? 'visible' : ''}`} style={{ opacity: isVisible(2) ? 1 : 0, transition: 'opacity 0.3s ease' }}> Previously, I was redefining the <span className="text-light-gray"><FallingText2 text="future of data collection" /></span> as the first design team <a href="https://www.bankofengland.co.uk/prudential-regulation/transforming-data-collection" target="_blank" rel="noopener noreferrer" className="text-gray">
                  <span className="interactive-text" style={{ fontStyle: 'italic' }}>
                    <span className="letter">a</span>
                    <span className="letter">t</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">t</span>
                    <span className="letter">h</span>
                    <span className="letter">e</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">B</span>
                    <span className="letter">a</span>
                    <span className="letter">n</span>
                    <span className="letter">k</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">o</span>
                    <span className="letter">f</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">E</span>
                    <span className="letter">n</span>
                    <span className="letter">g</span>
                    <span className="letter">l</span>
                    <span className="letter">a</span>
                    <span className="letter">n</span>
                    <span className="letter">d</span>
                  </span>
                </a></span><span className={`text-gray ${isVisible(3) ? 'visible' : ''}`} style={{ opacity: isVisible(3) ? 1 : 0, transition: 'opacity 0.3s ease' }}> and enabling clients to develop digital businesses with expertise in <span className="text-light-gray"><FallingText3 text="complex data systems" /></span> <a href="https://www.mckinsey.com/" target="_blank" rel="noopener noreferrer" className="text-gray">
                  <span className="interactive-text" style={{ fontStyle: 'italic' }}>
                    <span className="letter">a</span>
                    <span className="letter">t</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">M</span>
                    <span className="letter">c</span>
                    <span className="letter">K</span>
                    <span className="letter">i</span>
                    <span className="letter">n</span>
                    <span className="letter">s</span>
                    <span className="letter">e</span>
                    <span className="letter">y</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">&</span>
                    <span className="letter">&nbsp;</span>
                    <span className="letter">C</span>
                    <span className="letter">o</span>
                    <span className="letter">m</span>
                    <span className="letter">p</span>
                    <span className="letter">a</span>
                    <span className="letter">n</span>
                    <span className="letter">y</span>
                    <span className="letter">.</span>
                  </span>
                </a></span></div>
            </div>
          </div>
          <div className={`text-gray ${isVisible(5) ? 'visible' : ''}`} style={{ lineHeight: '1.5em', position: 'absolute', bottom: '4rem', opacity: isVisible(5) ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <a href="https://www.linkedin.com/in/so-heum-hwang/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}><HoverFallingText text="LinkedIn" className="hover-fall-text-1" /></a> | <a href="https://x.com/soheum8014" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}><HoverFallingText text="Playground" className="hover-fall-text-2" /></a> | <a href="mailto:sohheum@gmail.com" style={{ cursor: 'pointer' }}><HoverFallingText text="Email" className="hover-fall-text-3" /></a>
          </div>
        </div>

        {/* Middle blank section - 10% */}
        <div className="grid-section" style={{ width: '10%' }}></div>

        {/* Right section - 30% */}
        <div className="grid-section company" style={{ position: 'relative', minHeight: '100vh' }}>
          <div className={`line-group ${isVisible(4) ? 'visible' : ''}`} style={{ position: 'absolute', top: '50%', transform: 'translateY(-45%)' }}>
            <div className="text-gray" style={{ lineHeight: '1.5em' }}>
              Outside of design, I'm <a href="https://www.instagram.com/iso_heum/" target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}><HoverFallingText text="clicking camera shutters" className="hover-fall-text-4" /></a>, throwing clay on a wheel and writing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
