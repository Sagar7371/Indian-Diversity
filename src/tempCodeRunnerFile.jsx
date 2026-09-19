<?php
<div className="heroOverlay">
            <div className="eyebrow">IN A LIVING CULTURAL JOURNEY</div>
            <h1>
              Diversity of
              <br />
              <span>Indian Culture</span>
            </h1> 
            <h2>Unity in Diversity</h2>
            <p>Explore languages, food, festivals, arts, traditions and stories across all 28 states of India.</p>
            <div className="actions">
              <button className="primary" onClick={() => navScroll('states')}>
                Explore States <ArrowRight />
              </button>
              <button className="ghost" onClick={() => navScroll('map')}>
                View Map
              </button>
            </div>

            <div className="quickNavGrid">
              {[
                ['States & Regions', 'states'],
                ['Languages', 'languages'],
                ['Traditional Dresses', 'dresses'],
                ['Cuisine', 'cuisine'],
                ['Festivals', 'festivals'],
                ['Music & Dance', 'music'],
                ['Art & Handicrafts', 'art'],
                ['Architecture & Heritage', 'heritage'],
                ['Knowledge & Traditions', 'knowledge'],
                ['Modern India', 'modern'],
                ['Sports', 'sports']
              ].map(([label, target], index) => (
                <button key={label} type="button" className="quickNavCard" onClick={() => navScroll(target)}>
                  <span className="quickNavIndex">{String(index + 1).padStart(2, '0')}</span>
                  <span>{label}</span>
                  <ArrowRight className="quickNavArrow" size={15} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="intro">
          <div>
            <div className="eyebrow dark">INDIA, IN MANY VOICES</div>
            <h2>One country, many cultural worlds.</h2>
          </div>
          <p>
            India's cultural landscape is shaped by many languages, communities, landscapes, histories and artistic traditions.
            Explore examples rather than treating any state as culturally uniform.
          </p>
        </section>

        <section className="section regionSection">
          <div className="sectionHead">
            <div>
              <div className="eyebrow dark">GEOGRAPHICAL & REGIONAL DIVERSITY</div>
              <h2>India's regional landscapes</h2>
              <p>Every region carries a distinct blend of climate, language, food, dress, heritage and culture.</p>
            </div>
          </div>

          <div className="regionGrid">
            {regionProfiles.map((region) => (
              <article key={region.name} className="regionCard">
                <h3>{region.name}</h3>
                <p><b>Major states:</b> {region.states}</p>
                <p><b>Languages:</b> {region.languages}</p>
                <p><b>Dress:</b> {region.dress}</p>
                <p><b>Food:</b> {region.food}</p>
                <p><b>Festivals:</b> {region.festivals}</p>
                <p><b>Dance/Music:</b> {region.dance}</p>
                <p><b>Art:</b> {region.art}</p>
                <p><b>Heritage:</b> {region.heritage}</p>
              </article>
            ))}
          </div>