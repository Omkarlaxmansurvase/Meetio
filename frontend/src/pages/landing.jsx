import React from 'react'
import "../App.css"
import {Link} from "react-router-dom"

export default function LandingPage() {
  return (
    <div className='landingPageContainer'>
        
        <nav>
            <div className="navHeader">
              <h2>Meetio</h2>
            </div>
            <div className="navList">
              <p>Join as guest</p>
              <p>Register</p>
              <div role="button">
                <p>Login</p>
              </div>
            </div>
            
        </nav>

        <div className="landingMainContainer">
          <div>
            <h1><span style={{color: "#D97500"}}>connect</span> with your loved ones</h1>
            <p>join a distance by meetio :D</p>
            <div role='button'>
              <Link to={"/home"}>Get Started</Link>
            </div>
          </div>
          <div>

            <img src="/meet.png" alt="" />
          </div>
        </div>
        
    </div>
  )
}
