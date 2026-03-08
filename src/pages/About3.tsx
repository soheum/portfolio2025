import React from 'react';
import PhotoCloud3D from '../components/PhotoCloud3D';
import './About3.css';

const slideImages = [
  '/img/vinyl/slide-01.jpg',
  '/img/vinyl/slide-02.jpg',
  '/img/vinyl/slide-03.jpg',
  '/img/vinyl/slide-04.jpg',
  '/img/vinyl/slide-05.jpg',
  '/img/vinyl/slide-06.jpg',
  '/img/vinyl/slide-07.jpg',
  '/img/vinyl/slide-08.jpg',
];

const About3: React.FC = () => (
  <main className="about3-page">
    <div className="about3-box">
      <PhotoCloud3D images={slideImages} />
    </div>
  </main>
);

export default About3;
